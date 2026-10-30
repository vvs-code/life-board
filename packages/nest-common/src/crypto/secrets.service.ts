import {createCipheriv, createDecipheriv, randomBytes} from 'node:crypto';
import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service.js';

/**
 * Секреты (ключ модели, токен бота, пароль CalDAV) хранятся зашифрованными AES-256-GCM,
 * ключ из окружения (FR-8, NFR-8). Наружу отдаётся только маска.
 */
@Injectable()
export class SecretsService {
    private readonly key = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'hex');

    constructor(private readonly prisma: PrismaService) {}

    async set(key: string, value: string) {
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', this.key, iv);
        const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
        const valueEnc = Buffer.concat([iv, cipher.getAuthTag(), body]);
        await this.prisma.secret.upsert({where: {key}, create: {key, valueEnc}, update: {valueEnc}});
    }

    async get(key: string): Promise<string | null> {
        const row = await this.prisma.secret.findUnique({where: {key}});
        if (!row) return null;
        const buf = Buffer.from(row.valueEnc);
        const decipher = createDecipheriv('aes-256-gcm', this.key, buf.subarray(0, 12));
        decipher.setAuthTag(buf.subarray(12, 28));
        return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
    }

    static mask(value: string | null) {
        return value ? `${'•'.repeat(8)}${value.slice(-4)}` : null;
    }
}
