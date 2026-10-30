import express from 'express';
import { config } from './config.js';
import { pool } from './db.js';
import { log } from './log.js';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => log('info', 'request', { method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - started }));
  next();
});

// Обёртка, чтобы ошибки async-обработчиков уходили в общий error handler.
const h = (fn) => (req, res, next) => fn(req, res).catch(next);

// Универсальный CRUD по таблице с белым списком полей.
function crud(table, fields) {
  const router = express.Router();
  const pick = (body) => fields.filter((f) => body[f] !== undefined);

  router.get('/', h(async (req, res) => {
    const where = req.query.space_id && table === 'tasks' ? 'WHERE space_id = $1' : '';
    const params = where ? [Number(req.query.space_id)] : [];
    res.json((await pool.query(`SELECT * FROM ${table} ${where} ORDER BY id`, params)).rows);
  }));

  router.get('/:id', h(async (req, res) => {
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [req.params.id]);
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'not found' });
  }));

  router.post('/', h(async (req, res) => {
    const keys = pick(req.body);
    const { rows } = await pool.query(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
      keys.map((k) => req.body[k]),
    );
    res.status(201).json(rows[0]);
  }));

  router.put('/:id', h(async (req, res) => {
    const keys = pick(req.body);
    if (keys.length === 0) return res.status(400).json({ error: 'no fields' });
    const { rows } = await pool.query(
      `UPDATE ${table} SET ${keys.map((k, i) => `${k} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map((k) => req.body[k]), req.params.id],
    );
    rows[0] ? res.json(rows[0]) : res.status(404).json({ error: 'not found' });
  }));

  router.delete('/:id', h(async (req, res) => {
    const { rowCount } = await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
    rowCount ? res.status(204).end() : res.status(404).json({ error: 'not found' });
  }));

  return router;
}

app.use('/api/spaces', crud('spaces', ['name', 'color']));
app.use('/api/tasks', crud('tasks', ['space_id', 'title', 'description', 'deadline', 'priority', 'status']));

app.get('/health', h(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ status: 'ok' });
}));

app.use((err, req, res, next) => {
  log('error', err.message, { path: req.path });
  res.status(400).json({ error: err.message });
});

// Фактор VII: сервис сам слушает порт из окружения.
const server = app.listen(config.port, () => log('info', 'backend started', { port: config.port }));

// Фактор IX: корректное завершение по SIGTERM.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    log('info', 'shutting down', { signal });
    server.close(() => pool.end().then(() => process.exit(0)));
  });
}
