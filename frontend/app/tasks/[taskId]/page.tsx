import {AllocateSlotButton} from '../../../src/features/allocate-slot/ui/AllocateSlotButton';

/** Карточка задачи: поля, слоты, первый шаг, кнопка «Выделить слот», чаты задачи. */
export default async function TaskPage({params}: {params: Promise<{taskId: string}>}) {
    const {taskId} = await params;
    return (
        <main>
            <AllocateSlotButton taskId={taskId} estimateMinutes={null} />
        </main>
    );
}
