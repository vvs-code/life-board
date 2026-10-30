import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db.js';
import { log } from './log.js';

const state = { shuttingDown: false };
const app = createApp({ pool, state });

// Фактор VII: сервис сам слушает порт из окружения.
const server = app.listen(config.port, () => log('info', 'backend started', { port: config.port }));

// Фактор IX: по SIGTERM сначала выпадаем из readiness, чтобы Kubernetes убрал под
// из Service, затем дожидаемся текущих запросов и закрываем пул.
const DRAIN_MS = Number(process.env.SHUTDOWN_DRAIN_MS ?? 5000);

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    if (state.shuttingDown) return;
    state.shuttingDown = true;
    log('info', 'shutting down', { signal, drainMs: DRAIN_MS });
    setTimeout(() => server.close(() => pool.end().then(() => process.exit(0))), DRAIN_MS);
  });
}
