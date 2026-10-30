import {Injectable, type OnModuleDestroy} from '@nestjs/common';
import pg from 'pg';

/**
 * Единый канал доставки событий в интерфейс (ARCHITECTURE, раздел 5):
 * событие сначала пишется в базу, затем рассылается через pg_notify, backend ретранслирует его в SSE.
 * Поэтому перезапуск backend не рвёт прогон агента (NFR-5).
 */
@Injectable()
export class NotifyService implements OnModuleDestroy {
    private listener: pg.Client | null = null;

    constructor(private readonly databaseUrl = process.env.DATABASE_URL) {}

    async publish(channel: string, payload: unknown) {
        const client = new pg.Client({connectionString: this.databaseUrl});
        await client.connect();
        try {
            await client.query('SELECT pg_notify($1, $2)', [channel, JSON.stringify(payload)]);
        } finally {
            await client.end();
        }
    }

    async subscribe(channel: string, onMessage: (payload: unknown) => void) {
        if (!this.listener) {
            this.listener = new pg.Client({connectionString: this.databaseUrl});
            await this.listener.connect();
        }
        this.listener.on('notification', (msg) => {
            if (msg.channel === channel && msg.payload) onMessage(JSON.parse(msg.payload));
        });
        await this.listener.query(`LISTEN "${channel.replace(/"/g, '')}"`);
    }

    async onModuleDestroy() {
        await this.listener?.end();
    }
}
