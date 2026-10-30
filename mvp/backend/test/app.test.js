import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { createApp } from '../src/app.js';

// Фейковый пул: запоминает запросы и отвечает тем, что положил тест.
const pool = {
  calls: [],
  respond: async () => ({ rows: [], rowCount: 0 }),
  async query(sql, params) {
    this.calls.push({ sql, params });
    return this.respond(sql, params);
  },
};
const state = { shuttingDown: false };

let server;
let base;

before(async () => {
  server = createApp({ pool, state }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

beforeEach(() => {
  pool.calls = [];
  pool.respond = async () => ({ rows: [], rowCount: 0 });
  state.shuttingDown = false;
});

const req = (path, opts = {}) =>
  fetch(base + path, { headers: { 'Content-Type': 'application/json' }, ...opts });

describe('probes', () => {
  it('livez отвечает 200 и не ходит в базу', async () => {
    pool.respond = async () => { throw new Error('db down'); };
    const res = await req('/livez');
    assert.equal(res.status, 200);
    assert.equal(pool.calls.length, 0);
  });

  it('readyz отвечает 200, когда миграции применены', async () => {
    const res = await req('/readyz');
    assert.equal(res.status, 200);
    assert.match(pool.calls[0].sql, /schema_migrations/);
  });

  it('readyz отвечает 503, когда база недоступна', async () => {
    pool.respond = async () => { throw new Error('connection refused'); };
    assert.equal((await req('/readyz')).status, 503);
  });

  it('readyz отвечает 503 во время остановки, не трогая базу', async () => {
    state.shuttingDown = true;
    assert.equal((await req('/readyz')).status, 503);
    assert.equal(pool.calls.length, 0);
  });
});

describe('spaces', () => {
  it('POST без name — 400, в базу не ходит', async () => {
    const res = await req('/api/spaces', { method: 'POST', body: JSON.stringify({ color: '#fff' }) });
    assert.equal(res.status, 400);
    assert.equal(pool.calls.length, 0);
  });

  it('POST передаёт значения параметрами, а не строкой SQL', async () => {
    const name = "Работа'); DROP TABLE spaces; --";
    pool.respond = async () => ({ rows: [{ id: 1, name }], rowCount: 1 });
    const res = await req('/api/spaces', { method: 'POST', body: JSON.stringify({ name }) });
    assert.equal(res.status, 201);
    assert.deepEqual(pool.calls[0].params, [name, null]);
    assert.ok(!pool.calls[0].sql.includes(name));
  });

  it('PATCH несуществующего раздела — 404', async () => {
    const res = await req('/api/spaces/42', { method: 'PATCH', body: JSON.stringify({ name: 'x' }) });
    assert.equal(res.status, 404);
  });

  it('DELETE существующего раздела — 204', async () => {
    pool.respond = async () => ({ rows: [], rowCount: 1 });
    assert.equal((await req('/api/spaces/1', { method: 'DELETE' })).status, 204);
  });
});

describe('tasks', () => {
  it('некорректный id — 400', async () => {
    assert.equal((await req('/api/tasks/abc')).status, 400);
    assert.equal(pool.calls.length, 0);
  });

  it('GET несуществующей таски — 404', async () => {
    assert.equal((await req('/api/tasks/5')).status, 404);
  });

  it('фильтр по разделу уходит параметром', async () => {
    await req('/api/tasks?space_id=3');
    assert.deepEqual(pool.calls[0].params, [3]);
  });

  it('POST без title — 400', async () => {
    const res = await req('/api/tasks', { method: 'POST', body: JSON.stringify({ space_id: 1 }) });
    assert.equal(res.status, 400);
  });

  it('PATCH меняет только переданные поля', async () => {
    pool.respond = async () => ({ rows: [{ id: 7, status: 'done' }], rowCount: 1 });
    const res = await req('/api/tasks/7', { method: 'PATCH', body: JSON.stringify({ status: 'done' }) });
    assert.equal(res.status, 200);
    assert.deepEqual(pool.calls[0].params, [null, null, null, null, null, 'done', 7]);
  });
});

describe('errors', () => {
  it('нарушение CHECK в базе — 400', async () => {
    pool.respond = async () => { throw Object.assign(new Error('check'), { code: '23514' }); };
    const res = await req('/api/tasks', { method: 'POST', body: JSON.stringify({ space_id: 1, title: 't', priority: 'urgent' }) });
    assert.equal(res.status, 400);
  });

  it('неожиданная ошибка — 500 без деталей наружу', async () => {
    pool.respond = async () => { throw new Error('secret internals'); };
    const res = await req('/api/spaces');
    assert.equal(res.status, 500);
    assert.equal((await res.json()).error, 'internal error');
  });

  it('битый JSON — 400', async () => {
    const res = await req('/api/spaces', { method: 'POST', body: '{oops' });
    assert.equal(res.status, 400);
  });
});
