'use client';
import {useEffect} from 'react';

/** Подписка на SSE: ответы агента, проактивные сообщения, статус синхронизации (ARCHITECTURE, раздел 5). */
export function useEventStream(path: string, onEvent: (data: unknown) => void) {
    useEffect(() => {
        const source = new EventSource(`/events/${path}`);
        source.onmessage = (e) => onEvent(JSON.parse(e.data));
        return () => source.close();
    }, [path, onEvent]);
}
