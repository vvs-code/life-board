import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Все настройки в вебе, без перезапуска (FR-41). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class SettingsService {
    constructor(private readonly prisma: PrismaService) {}

    /** секреты отдаются только маской (FR-8) */
    async get(): Promise<unknown> {
        throw new NotImplementedException('settings.get');
    }

    /** действуют со следующего тика */
    async update(input: unknown): Promise<unknown> {
        throw new NotImplementedException('settings.update');
    }
}
