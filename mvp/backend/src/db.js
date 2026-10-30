import pg from 'pg';
import { config } from './config.js';

// Фактор IV: Postgres — подключаемый ресурс, адрес только из DATABASE_URL.
export const pool = new pg.Pool({ connectionString: config.databaseUrl });
