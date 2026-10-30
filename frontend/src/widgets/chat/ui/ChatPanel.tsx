'use client';
import {Button, TextArea} from '@gravity-ui/uikit';
import {useCallback, useState} from 'react';
import {trpc} from '../../../shared/api/trpc';
import {useEventStream} from '../../../shared/api/useEventStream';

/**
 * Чат с ассистентом любого уровня: общий, раздел, задача (FR-37).
 * Сообщение уходит через tRPC, ответ приходит по SSE и не теряется при перезагрузке (FR-40).
 */
export function ChatPanel({chatId}: {chatId: string}) {
    const history = trpc.chats.history.useQuery({chatId});
    const send = trpc.chats.send.useMutation();
    const [text, setText] = useState('');
    const onEvent = useCallback(() => void history.refetch(), [history]);
    useEventStream(`chat/${chatId}`, onEvent);

    return (
        <div>
            <pre>{JSON.stringify(history.data, null, 2)}</pre>
            <TextArea value={text} onUpdate={setText} placeholder="Например: перенеси стоматолога на четверг" />
            <Button view="action" onClick={() => send.mutate({chatId, text})}>
                Отправить
            </Button>
        </div>
    );
}
