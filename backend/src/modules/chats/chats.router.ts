import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {ChatsService} from './chats.service.js';

/** Чаты трёх уровней: общий, раздел, задача (FR-37–FR-40). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class ChatsRouter {
    public readonly router;

    constructor(trpcService: TrpcService, chatsService: ChatsService) {
        this.router = trpcService.router({
            list: trpcService.procedureWithAuth
                .input(z.object({level: z.enum(["core", "space", "task"]), scopeId: z.string().optional()}))
                .query(({input}) => chatsService.list(input)),
            history: trpcService.procedureWithAuth
                .input(z.object({chatId: z.string().uuid()}))
                .query(({input}) => chatsService.history(input)),
            send: trpcService.procedureWithAuth
                .input(z.object({chatId: z.string().uuid(), text: z.string().min(1)}))
                .mutation(({input}) => chatsService.send(input)),
            create: trpcService.procedureWithAuth
                .input(z.object({level: z.enum(["core", "space", "task"]), scopeId: z.string().optional(), title: z.string()}))
                .mutation(({input}) => chatsService.create(input)),
        });
    }
}
