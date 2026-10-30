import {Injectable, type OnModuleDestroy, type OnModuleInit} from '@nestjs/common';
import {PrismaService, SecretsService} from '@lifeboard/nest-common';
import {Bot, InlineKeyboard} from 'grammy';

/**
 * Telegram-бот: long polling, публичный HTTPS для self-host не нужен.
 * Отвечает только привязанному чату владельца, на чужие сообщения молчит (FR-7, BR-7).
 * Переписка — обычный общий чат, видимый в вебе (FR-39).
 */
@Injectable()
export class TelegramBot implements OnModuleInit, OnModuleDestroy {
    private bot: Bot | null = null;

    constructor(
        private readonly prisma: PrismaService,
        private readonly secrets: SecretsService,
    ) {}

    async onModuleInit() {
        const token = await this.secrets.get('telegram_token');
        if (!token) return; // мастер ещё не пройден

        this.bot = new Bot(token);

        // Привязка по одноразовой deep-ссылке из мастера: t.me/<bot>?start=<token>
        this.bot.command('start', async (ctx) => {
            // TODO: сверить одноразовый токен, записать ctx.chat.id в Settings.telegramChatId.
        });

        this.bot.on('message:text', async (ctx) => {
            const settings = await this.prisma.settings.findUnique({where: {id: 1}});
            if (!settings?.telegramChatId || BigInt(ctx.chat.id) !== settings.telegramChatId) return;
            // TODO: INSERT message в телеграм-чат и agent_run(kind=chat); ответ уйдёт сюда и в веб.
        });

        // Кнопки под напоминанием (FR-33).
        this.bot.callbackQuery(/^done:(.+)$/, async (ctx) => {
            // TODO: закрыть задачу ctx.match[1]
        });
        this.bot.callbackQuery(/^slot:(.+)$/, async (ctx) => {
            // TODO: выделить слот под задачу
        });
        this.bot.callbackQuery(/^snooze:(.+)$/, async (ctx) => {
            // TODO: snoozedUntil = завтра
        });

        void this.bot.start();
    }

    reminderKeyboard(taskId: string) {
        return new InlineKeyboard().text('Сделано', `done:${taskId}`).text('Выделить слот', `slot:${taskId}`).text('Отложить', `snooze:${taskId}`);
    }

    async onModuleDestroy() {
        await this.bot?.stop();
    }
}
