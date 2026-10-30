import {Injectable} from '@nestjs/common';
import {Interval} from '@nestjs/schedule';
import {PrismaService, SecretsService} from '@lifeboard/nest-common';

/**
 * Двусторонняя синхронизация с календарём (FR-17, FR-18, ARCHITECTURE 6.4).
 *  1. REPORT sync-collection с сохранённым sync-token: без полного перечитывания после рестарта.
 *  2. Внешние изменения: upsert событий; ответ на приглашение меняет статус слота (FR-24).
 *  3. Наши изменения (dirty) уходят PUT/DELETE с If-Match по ETag.
 *  4. Конфликты: черновой слот переносим молча, подтверждённый не трогаем (BR-2, BR-3).
 */
@Injectable()
export class CalDavSyncJob {
    constructor(
        private readonly prisma: PrismaService,
        private readonly secrets: SecretsService,
    ) {}

    @Interval(60_000)
    async run() {
        const spaces = await this.prisma.space.findMany();
        for (const space of spaces) {
            for (const calendarUrl of [space.eventsCalendar, space.tasksCalendar]) {
                if (!calendarUrl) continue;
                await this.syncCalendar(calendarUrl);
            }
        }
    }

    private async syncCalendar(calendarUrl: string) {
        const state = await this.prisma.calendarSync.findUnique({where: {calendarUrl}});
        // TODO: tsdav syncCollection(calendarUrl, state?.syncToken) → изменения → upsert / ответы на приглашения
        // TODO: отправить dirty-события, обработать 412 Precondition Failed как конфликт
        await this.prisma.calendarSync.upsert({
            where: {calendarUrl},
            create: {calendarUrl, syncedAt: new Date()},
            update: {syncedAt: new Date(), syncToken: state?.syncToken},
        });
    }
}
