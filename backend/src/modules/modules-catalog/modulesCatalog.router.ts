import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {ModulesCatalogService} from './modulesCatalog.service.js';

/** Каталог MCP-модулей из modules/<id>/module.json. После MVP. Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class ModulesCatalogRouter {
    public readonly router;

    constructor(trpcService: TrpcService, modulesCatalogService: ModulesCatalogService) {
        this.router = trpcService.router({
            list: trpcService.procedureWithAuth
                .query(() => modulesCatalogService.list()),
            toggle: trpcService.procedureWithAuth
                .input(z.object({moduleId: z.string(), enabled: z.boolean(), spaceIds: z.array(z.string().uuid())}))
                .mutation(({input}) => modulesCatalogService.toggle(input)),
        });
    }
}
