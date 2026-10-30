/**
 * Каналы Postgres LISTEN/NOTIFY. Всё, что происходит не по запросу пользователя
 * (ответы агента, проактивные сообщения, результаты с машины, статус синхронизации),
 * сначала пишется в базу, потом рассылается сюда; backend ретранслирует в SSE.
 */
export const chatChannel = (chatId: string) => `chat:${chatId}`;
export const UI_EVENTS_CHANNEL = 'ui:events';
