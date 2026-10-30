import {Controller, Param, Sse, type MessageEvent} from '@nestjs/common';
import {chatChannel, UI_EVENTS_CHANNEL} from '@lifeboard/common';
import {NotifyService} from '@lifeboard/nest-common';
import {Observable} from 'rxjs';

/**
 * Ретранслятор событий в веб: Postgres NOTIFY → SSE (ARCHITECTURE, раздел 5).
 * Веб переподключился — читает историю из базы и продолжает слушать; ничего не теряется (FR-40).
 */
@Controller('events')
export class EventsStreamController {
    constructor(private readonly notify: NotifyService) {}

    @Sse('chat/:chatId')
    chat(@Param('chatId') chatId: string): Observable<MessageEvent> {
        return this.stream(chatChannel(chatId));
    }

    @Sse('ui')
    ui(): Observable<MessageEvent> {
        return this.stream(UI_EVENTS_CHANNEL);
    }

    private stream(channel: string) {
        return new Observable<MessageEvent>((subscriber) => {
            void this.notify.subscribe(channel, (data) => subscriber.next({data: data as object}));
        });
    }
}
