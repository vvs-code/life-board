// Фактор XI: логи — поток событий в stdout, без файлов и ротации.
export function log(level, msg, extra = {}) {
  process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...extra }) + '\n');
}
