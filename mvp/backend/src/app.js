import express from 'express';
import { log } from './log.js';

// Ошибки Postgres, которые означают некорректный запрос клиента, а не сбой сервера.
const CLIENT_PG_ERRORS = new Set([
  '22P02', // invalid_text_representation
  '22007', // invalid_datetime_format
  '23502', // not_null_violation
  '23503', // foreign_key_violation
  '23514', // check_violation
]);

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const h = (fn) => (req, res, next) => fn(req, res).catch(next);

function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'id must be a positive integer');
  return id;
}

function requireString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') throw new HttpError(400, `${field} is required`);
  return value.trim();
}

const orNull = (v) => (v === undefined ? null : v);

function spacesRouter(pool) {
  const r = express.Router();

  r.get('/', h(async (req, res) => {
    res.json((await pool.query('SELECT id, name, color, created_at FROM spaces ORDER BY id')).rows);
  }));

  r.get('/:id', h(async (req, res) => {
    const { rows } = await pool.query('SELECT id, name, color, created_at FROM spaces WHERE id = $1', [parseId(req.params.id)]);
    if (!rows[0]) throw new HttpError(404, 'space not found');
    res.json(rows[0]);
  }));

  r.post('/', h(async (req, res) => {
    const name = requireString(req.body.name, 'name');
    const { rows } = await pool.query(
      "INSERT INTO spaces (name, color) VALUES ($1, COALESCE($2, '#2F9E6B')) RETURNING id, name, color, created_at",
      [name, orNull(req.body.color)],
    );
    res.status(201).json(rows[0]);
  }));

  r.patch('/:id', h(async (req, res) => {
    const { rows } = await pool.query(
      `UPDATE spaces SET name = COALESCE($1, name), color = COALESCE($2, color)
       WHERE id = $3 RETURNING id, name, color, created_at`,
      [orNull(req.body.name), orNull(req.body.color), parseId(req.params.id)],
    );
    if (!rows[0]) throw new HttpError(404, 'space not found');
    res.json(rows[0]);
  }));

  r.delete('/:id', h(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM spaces WHERE id = $1', [parseId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, 'space not found');
    res.status(204).end();
  }));

  return r;
}

const TASK_COLUMNS = 'id, space_id, title, description, deadline, priority, status, created_at';

function tasksRouter(pool) {
  const r = express.Router();

  r.get('/', h(async (req, res) => {
    const spaceId = req.query.space_id === undefined ? null : parseId(req.query.space_id);
    const { rows } = await pool.query(
      `SELECT ${TASK_COLUMNS} FROM tasks WHERE ($1::int IS NULL OR space_id = $1) ORDER BY id`,
      [spaceId],
    );
    res.json(rows);
  }));

  r.get('/:id', h(async (req, res) => {
    const { rows } = await pool.query(`SELECT ${TASK_COLUMNS} FROM tasks WHERE id = $1`, [parseId(req.params.id)]);
    if (!rows[0]) throw new HttpError(404, 'task not found');
    res.json(rows[0]);
  }));

  r.post('/', h(async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
      `INSERT INTO tasks (space_id, title, description, deadline, priority, status)
       VALUES ($1, $2, COALESCE($3, ''), $4, COALESCE($5, 'mid'), COALESCE($6, 'todo'))
       RETURNING ${TASK_COLUMNS}`,
      [parseId(b.space_id), requireString(b.title, 'title'), orNull(b.description), orNull(b.deadline), orNull(b.priority), orNull(b.status)],
    );
    res.status(201).json(rows[0]);
  }));

  r.patch('/:id', h(async (req, res) => {
    const b = req.body;
    const { rows } = await pool.query(
      `UPDATE tasks SET
         space_id    = COALESCE($1, space_id),
         title       = COALESCE($2, title),
         description = COALESCE($3, description),
         deadline    = COALESCE($4, deadline),
         priority    = COALESCE($5, priority),
         status      = COALESCE($6, status)
       WHERE id = $7 RETURNING ${TASK_COLUMNS}`,
      [
        b.space_id === undefined ? null : parseId(b.space_id),
        orNull(b.title), orNull(b.description), orNull(b.deadline), orNull(b.priority), orNull(b.status),
        parseId(req.params.id),
      ],
    );
    if (!rows[0]) throw new HttpError(404, 'task not found');
    res.json(rows[0]);
  }));

  r.delete('/:id', h(async (req, res) => {
    const { rowCount } = await pool.query('DELETE FROM tasks WHERE id = $1', [parseId(req.params.id)]);
    if (!rowCount) throw new HttpError(404, 'task not found');
    res.status(204).end();
  }));

  return r;
}

/**
 * @param {{ pool: { query: Function }, state?: { shuttingDown: boolean } }} deps
 */
export function createApp({ pool, state = { shuttingDown: false } }) {
  const app = express();
  app.use(express.json());

  app.use((req, res, next) => {
    const started = Date.now();
    // Путь фиксируем до роутинга: смонтированный роутер обрезает req.url, и к 'finish' он уже испорчен.
    const path = req.path;
    res.on('finish', () => {
      if (path === '/livez' || path === '/readyz') return;
      log('info', 'request', { method: req.method, path, status: res.statusCode, ms: Date.now() - started });
    });
    next();
  });

  // Liveness: процесс жив и отвечает. В базу не ходит — её недоступность не повод перезапускать под.
  app.get('/livez', (req, res) => res.json({ status: 'ok' }));

  // Readiness: можно ли слать трафик. Нет — если идёт остановка, база недоступна или миграции не применены.
  app.get('/readyz', h(async (req, res) => {
    if (state.shuttingDown) return res.status(503).json({ status: 'shutting down' });
    try {
      await pool.query('SELECT 1 FROM schema_migrations LIMIT 1');
      res.json({ status: 'ready' });
    } catch (err) {
      res.status(503).json({ status: 'not ready', reason: err.message });
    }
  }));

  app.use('/api/spaces', spacesRouter(pool));
  app.use('/api/tasks', tasksRouter(pool));

  app.use((err, req, res, next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'invalid JSON' });
    if (CLIENT_PG_ERRORS.has(err.code)) return res.status(400).json({ error: err.detail ?? err.message });
    log('error', err.message, { path: req.path, code: err.code });
    res.status(500).json({ error: 'internal error' });
  });

  return app;
}
