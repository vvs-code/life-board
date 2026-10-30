import {Injectable} from '@nestjs/common';
import {z} from 'zod';
import {TrpcService} from '../../trpc/trpc.service.js';
import {PlanningService} from './planning.service.js';

/** Свободное время и слоты под задачи (FR-20, FR-22). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class PlanningRouter {
    public readonly router;

    constructor(trpcService: TrpcService, planningService: PlanningService) {
        this.router = trpcService.router({
            freeTime: trpcService.procedureWithAuth
                .input(z.object({taskId: z.string().uuid()}))
                .query(({input}) => planningService.freeTime(input)),
            allocateSlot: trpcService.procedureWithAuth
                .input(z.object({taskId: z.string().uuid(), minutes: z.number().int().positive().optional()}))
                .mutation(({input}) => planningService.allocateSlot(input)),
            removeSlot: trpcService.procedureWithAuth
                .input(z.object({slotId: z.string().uuid()}))
                .mutation(({input}) => planningService.removeSlot(input)),
        });
    }
}
