import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Вход по паролю, сессии в таблице, блокировка подбора (FR-4–FR-6). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    /** argon2id, после 5 ошибок блокировка на 15 минут и сообщение в бот */
    async login(input: unknown): Promise<unknown> {
        throw new NotImplementedException('auth.login');
    }

    /** удаляет текущую сессию */
    async logout(): Promise<unknown> {
        throw new NotImplementedException('auth.logout');
    }

    /** удаляет все сессии (FR-5) */
    async logoutEverywhere(): Promise<unknown> {
        throw new NotImplementedException('auth.logoutEverywhere');
    }
}
