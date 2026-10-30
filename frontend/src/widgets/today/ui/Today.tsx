import {Text} from '@gravity-ui/uikit';
import {serverTrpc} from '../../../shared/api/trpc';
import {TaskRow} from '../../../entities/task/ui/TaskRow';

/**
 * Экран «Сегодня»: задачи по приоритету и сроку. Календарной сетки в вебе нет — календарь смотрят
 * в родном приложении, веб нужен для разбора и настройки.
 */
export async function Today() {
    const tasks = (await serverTrpc.tasks.list.query({})) as never[];
    return (
        <section>
            <Text variant="header-1">Сегодня</Text>
            {tasks.map((task) => (
                <TaskRow key={(task as {id: string}).id} task={task} />
            ))}
        </section>
    );
}
