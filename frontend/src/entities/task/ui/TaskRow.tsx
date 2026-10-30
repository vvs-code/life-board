import type {Task} from '@lifeboard/common';
import {Label, Text} from '@gravity-ui/uikit';
import {PRIORITY_LABEL, PRIORITY_THEME} from '../model/priority';

/** Строка задачи: приоритет, название, срок и первый шаг, с которого проще начать. */
export function TaskRow({task}: {task: Task}) {
    return (
        <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
            <Label theme={PRIORITY_THEME[task.priority]}>{PRIORITY_LABEL[task.priority]}</Label>
            <Text variant="body-2">{task.title}</Text>
            {task.deadline && <Text color="secondary">до {task.deadline.toLocaleDateString('ru-RU')}</Text>}
            {task.firstStep && <Text color="secondary">Первый шаг: {task.firstStep}</Text>}
        </div>
    );
}
