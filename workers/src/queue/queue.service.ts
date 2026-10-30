import {Injectable, type OnModuleDestroy, type OnModuleInit} from '@nestjs/common';
import PgBoss from 'pg-boss';

/**
 * Технические задачи — pg-boss: ретраи с backoff, возврат зависших, отложенный запуск, дедупликация.
 * Агентные прогоны сюда не кладём: это доменная сущность agent_run со статусом в интерфейсе (ARCHITECTURE, раздел 4).
 */
export const JOBS = {
    caldavSync: 'caldav.sync',
    proactiveTick: 'proactive.tick',
    telegramSend: 'telegram.send',
} as const;

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
    readonly boss = new PgBoss({connectionString: process.env.DATABASE_URL, schema: 'pgboss'});

    async onModuleInit() {
        await this.boss.start();
        for (const name of Object.values(JOBS)) await this.boss.createQueue(name);
    }

    async onModuleDestroy() {
        await this.boss.stop({graceful: true});
    }
}
