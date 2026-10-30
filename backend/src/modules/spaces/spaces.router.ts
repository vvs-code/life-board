import {SpaceCreateSchema, SpacePatchSchema} from '@lifeboard/common';
import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {SpacesService} from './spaces.service.js';

/** Разделы жизни; «Жизнь» удалить нельзя (FR-9, FR-10). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class SpacesRouter {
    public readonly router;

    constructor(trpcService: TrpcService, spacesService: SpacesService) {
        this.router = trpcService.router({
            list: trpcService.procedureWithAuth
                .query(() => spacesService.list()),
            create: trpcService.procedureWithAuth
                .input(SpaceCreateSchema)
                .mutation(({input}) => spacesService.create(input)),
            update: trpcService.procedureWithAuth
                .input(z.object({id: z.string().uuid(), patch: SpacePatchSchema}))
                .mutation(({input}) => spacesService.update(input)),
            remove: trpcService.procedureWithAuth
                .input(z.object({id: z.string().uuid()}))
                .mutation(({input}) => spacesService.remove(input)),
        });
    }
}
