'use client';
import {Button} from '@gravity-ui/uikit';
import {trpc} from '../../../shared/api/trpc';

/** Кнопка «Выделить слот», предзаполненная оценкой ИИ (FR-21, FR-22). Слоты уйдут в календарь приглашением. */
export function AllocateSlotButton({taskId, estimateMinutes}: {taskId: string; estimateMinutes: number | null}) {
    const allocate = trpc.planning.allocateSlot.useMutation();
    const hours = estimateMinutes ? Math.round(estimateMinutes / 30) / 2 : null;
    return (
        <Button view="action" loading={allocate.isPending} onClick={() => allocate.mutate({taskId})}>
            Выделить слот{hours ? ` · ${hours} ч` : ''}
        </Button>
    );
}
