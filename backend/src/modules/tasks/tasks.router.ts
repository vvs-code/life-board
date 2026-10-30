import {TaskCreateSchema, TaskPatchSchema} from '@lifeboard/common';
import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {TasksService} from './tasks.service.js';

/** Задачи: срок, приоритет, первый шаг, статус (FR-11, FR-12, FR-14). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class TasksRouter {
    public readonly router;

    constructor(trpcService: TrpcService, tasksService: TasksService) {
        this.router = trpcService.router({
            list: trpcService.procedureWithAuth
                .input(z.object({spaceId: z.string().uuid().optional()}))
                .query(({input}) => tasksService.list(input)),
            get: trpcService.procedureWithAuth
                .input(z.object({id: z.string().uuid()}))
                .query(({input}) => tasksService.get(input)),
            create: trpcService.procedureWithAuth
                .input(TaskCreateSchema)
                .mutation(({input}) => tasksService.create(input)),
            update: trpcService.procedureWithAuth
                .input(z.object({id: z.string().uuid(), patch: TaskPatchSchema}))
                .mutation(({input}) => tasksService.update(input)),
            remove: trpcService.procedureWithAuth
                .input(z.object({id: z.string().uuid()}))
                .mutation(({input}) => tasksService.remove(input)),
        });
    }
}
