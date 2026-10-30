import {z} from 'zod';

/**
 * Окружение процесса. .env машинный: его пишет установщик, человек туда не ходит (ARCHITECTURE, раздел 10).
 * Всё остальное настраивается в вебе и лежит в базе (FR-41).
 */
export const EnvSchema = z.object({
    DATABASE_URL: z.string().url(),
    ENCRYPTION_KEY: z.string().length(64, 'hex-ключ на 32 байта'),
    PUBLIC_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
    SETUP_TOKEN: z.string().optional(),
});
export type Env = z.infer<typeof EnvSchema>;

export const loadEnv = (): Env => EnvSchema.parse(process.env);
