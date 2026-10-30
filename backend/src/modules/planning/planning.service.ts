import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Свободное время и слоты под задачи (FR-20, FR-22). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class PlanningService {
    constructor(private readonly prisma: PrismaService) {}

    /** свободные часы до срока из packages/common/planning */
    async freeTime(input: unknown): Promise<unknown> {
        throw new NotImplementedException('planning.freeTime');
    }

    /** кнопка «Выделить слот»: слоты уходят в календарь приглашением (FR-23) */
    async allocateSlot(input: unknown): Promise<unknown> {
        throw new NotImplementedException('planning.allocateSlot');
    }

    async removeSlot(input: unknown): Promise<unknown> {
        throw new NotImplementedException('planning.removeSlot');
    }
}
