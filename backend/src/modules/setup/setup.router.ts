import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {SetupService} from './setup.service.js';

/** Мастер первого запуска: пароль, модель, бот, календарь (FR-2, FR-3). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class SetupRouter {
    public readonly router;

    constructor(trpcService: TrpcService, setupService: SetupService) {
        this.router = trpcService.router({
            status: trpcService.procedure
                .query(() => setupService.status()),
            setPassword: trpcService.procedureWithSetup
                .input(z.object({password: z.string().min(10)}))
                .mutation(({input}) => setupService.setPassword(input)),
            checkModelKey: trpcService.procedureWithSetup
                .input(z.object({apiKey: z.string()}))
                .mutation(({input}) => setupService.checkModelKey(input)),
            linkTelegram: trpcService.procedureWithSetup
                .input(z.object({botToken: z.string()}))
                .mutation(({input}) => setupService.linkTelegram(input)),
            checkCalDav: trpcService.procedureWithSetup
                .input(z.object({url: z.string().url(), login: z.string(), password: z.string()}))
                .mutation(({input}) => setupService.checkCalDav(input)),
        });
    }
}
