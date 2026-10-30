import {NestFactory} from '@nestjs/core';
import {migrateWithBackup} from './migrations/migrate-with-backup.js';
import {WorkerModule} from './worker.module.js';

/**
 * workers: всё, что идёт само и долго — Telegram, расписания, синхронизация календаря, агентные прогоны.
 * Тот же образ, что у backend, другая точка входа. Миграции применяются здесь при старте после дампа:
 * инстанс один, гонки стартов нет, а обновление остаётся одной командой (ARCHITECTURE, раздел 10).
 */
async function bootstrap() {
    await migrateWithBackup();
    const app = await NestFactory.createApplicationContext(WorkerModule);
    app.enableShutdownHooks(['SIGTERM', 'SIGINT']);
}

void bootstrap();
