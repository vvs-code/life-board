import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Чаты трёх уровней: общий, раздел, задача (FR-37–FR-40). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class ChatsService {
    constructor(private readonly prisma: PrismaService) {}

    async list(input: unknown): Promise<unknown> {
        throw new NotImplementedException('chats.list');
    }

    async history(input: unknown): Promise<unknown> {
        throw new NotImplementedException('chats.history');
    }

    /** пишет сообщение и ставит agent_run (kind=chat); ответ придёт через SSE */
    async send(input: unknown): Promise<unknown> {
        throw new NotImplementedException('chats.send');
    }

    async create(input: unknown): Promise<unknown> {
        throw new NotImplementedException('chats.create');
    }
}
