import {execFileSync} from 'node:child_process';

/** Перед миграцией снимается дамп, чтобы `lifeboard rollback` вернул образ и базу вместе (NFR-13). */
export async function migrateWithBackup() {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    execFileSync('pg_dump', ['--dbname', process.env.DATABASE_URL ?? '', '--file', `/backups/pre-migrate-${stamp}.sql`]);
    execFileSync('pnpm', ['--filter', '@lifeboard/db', 'migrate'], {stdio: 'inherit'});
}
