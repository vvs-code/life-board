import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {AuthService} from './auth.service.js';

/** Вход по паролю, сессии в таблице, блокировка подбора (FR-4–FR-6). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class AuthRouter {
    public readonly router;

    constructor(trpcService: TrpcService, authService: AuthService) {
        this.router = trpcService.router({
            login: trpcService.procedure
                .input(z.object({password: z.string()}))
                .mutation(({input}) => authService.login(input)),
            logout: trpcService.procedureWithAuth
                .mutation(() => authService.logout()),
            logoutEverywhere: trpcService.procedureWithAuth
                .mutation(() => authService.logoutEverywhere()),
        });
    }
}
