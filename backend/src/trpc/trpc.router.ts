import {type INestApplication, Injectable} from '@nestjs/common';
import {createExpressMiddleware, type CreateExpressContextOptions} from '@trpc/server/adapters/express';
import {AuthRouter} from '../modules/auth/auth.router.js';
import {SetupRouter} from '../modules/setup/setup.router.js';
import {SpacesRouter} from '../modules/spaces/spaces.router.js';
import {TasksRouter} from '../modules/tasks/tasks.router.js';
import {PlanningRouter} from '../modules/planning/planning.router.js';
import {ChatsRouter} from '../modules/chats/chats.router.js';
import {SettingsRouter} from '../modules/settings/settings.router.js';
import {ModulesCatalogRouter} from '../modules/modules-catalog/modulesCatalog.router.js';
import {TrpcService} from './trpc.service.js';

const SESSION_COOKIE = 'lb_session';

function createContext({req, res}: CreateExpressContextOptions) {
    const sessionId: string | null = req.cookies?.[SESSION_COOKIE] ?? null;
    const setupToken = req.header('x-setup-token') ?? null;
    return {req, res, sessionId, setupToken};
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;

/** Общий роутер: собирает роутеры модулей в appRouter, как в solvehub. */
@Injectable()
export class TrpcRouter {
    public readonly appRouter;

    constructor(
        trpcService: TrpcService,
        authRouter: AuthRouter,
        setupRouter: SetupRouter,
        spacesRouter: SpacesRouter,
        tasksRouter: TasksRouter,
        planningRouter: PlanningRouter,
        chatsRouter: ChatsRouter,
        settingsRouter: SettingsRouter,
        modulesCatalogRouter: ModulesCatalogRouter,
    ) {
        this.appRouter = trpcService.router({
            auth: authRouter.router,
            setup: setupRouter.router,
            spaces: spacesRouter.router,
            tasks: tasksRouter.router,
            planning: planningRouter.router,
            chats: chatsRouter.router,
            settings: settingsRouter.router,
            modulesCatalog: modulesCatalogRouter.router,
        });
    }

    applyMiddleware(app: INestApplication) {
        app.use('/trpc', createExpressMiddleware({router: this.appRouter, createContext}));
    }
}

export type AppRouter = TrpcRouter['appRouter'];
