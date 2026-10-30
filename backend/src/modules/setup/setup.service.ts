import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Мастер первого запуска: пароль, модель, бот, календарь (FR-2, FR-3). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class SetupService {
    constructor(private readonly prisma: PrismaService) {}

    /** пройден ли мастер */
    async status(): Promise<unknown> {
        throw new NotImplementedException('setup.status');
    }

    async setPassword(input: unknown): Promise<unknown> {
        throw new NotImplementedException('setup.setPassword');
    }

    /** пробный запрос к модели, ключ сохраняется зашифрованным */
    async checkModelKey(input: unknown): Promise<unknown> {
        throw new NotImplementedException('setup.checkModelKey');
    }

    /** возвращает одноразовую deep-ссылку t.me/<bot>?start=<token> (FR-7) */
    async linkTelegram(input: unknown): Promise<unknown> {
        throw new NotImplementedException('setup.linkTelegram');
    }

    /** PROPFIND; при успехе создаёт два календаря «Жизни» */
    async checkCalDav(input: unknown): Promise<unknown> {
        throw new NotImplementedException('setup.checkCalDav');
    }
}
