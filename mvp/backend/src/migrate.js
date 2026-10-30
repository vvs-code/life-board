// Фактор XII: миграции — разовый административный процесс из того же кода и образа.
import { readdir, readFile } from 'node:fs/promises';
import { pool } from './db.js';
import { log } from './log.js';

const dir = new URL('../migrations/', import.meta.url);

await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
const applied = new Set((await pool.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name));

for (const file of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
  if (applied.has(file)) continue;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(await readFile(new URL(file, dir), 'utf8'));
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    await client.query('COMMIT');
    log('info', 'migration applied', { file });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

await pool.end();
log('info', 'migrations done');
