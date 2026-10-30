import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {findReasons, pickForDigest} from '@lifeboard/common';
import {PrismaService} from '@lifeboard/nest-common';

/**
 * Тик проактивности (ARCHITECTURE 6.3).
 * Повод ищут детерминированные правила (FR-28, BR-6). Нет повода — выходим молча, без вызова модели (FR-27).
 * Есть повод — не больше N задач по приоритету и сроку (FR-29), модель формулирует текст с первым шагом (FR-30).
 */
@Injectable()
export class ProactiveTickJob {
    constructor(private readonly prisma: PrismaService) {}

    @Cron('*/15 * * * *')
    async tick() {
        const settings = await this.prisma.settings.findUnique({where: {id: 1}});
        if (!settings) return;

        const snapshots = await this.loadSnapshots(); // свободное время до срока считает packages/common/planning
        const reasons = findReasons(snapshots, new Date(), {
            staleAfterDays: settings.staleAfterDays,
            lowPriorityReserveMinutes: settings.lowPriorityReserveMinutes,
        });
        if (reasons.length === 0) return;

        const picked = pickForDigest(reasons, settings.digestLimit);
        await this.prisma.agentRun.create({
            data: {kind: 'proactive', prompt: JSON.stringify({reasons: picked, persistence: settings.persistence})},
        });
    }

    private async loadSnapshots() {
        // TODO: задачи со слотами и событиями → TaskSnapshot[] через freeMinutesUntil()
        return [];
    }
}
