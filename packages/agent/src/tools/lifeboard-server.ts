import {createSdkMcpServer, tool} from '@anthropic-ai/claude-agent-sdk';
import {PrioritySchema} from '@lifeboard/common';
import {z} from 'zod';

/**
 * Доменные тулы — in-process MCP-сервер: живёт в том же процессе и ходит в базу напрямую,
 * отдельный процесс не нужен. Реализацию даёт вызывающий сервис через порт LifeboardPort.
 */
export interface LifeboardPort {
    findTasks(q: {spaceId?: string; text?: string; overdue?: boolean}): Promise<unknown[]>;
    createTask(t: {spaceId: string; title: string; deadline?: string; priority: string; firstStep?: string}): Promise<{id: string}>;
    updateTask(id: string, patch: Record<string, unknown>): Promise<void>;
    allocateSlot(taskId: string, minutes?: number): Promise<{slots: unknown[]; missingMinutes: number}>;
    findEvents(q: {from: string; to: string; text?: string}): Promise<unknown[]>;
    moveEvent(id: string, start: string, end: string): Promise<{conflicts: unknown[]}>;
    deleteItem(kind: 'task' | 'event', id: string): Promise<void>;
}

const text = (value: unknown) => ({content: [{type: 'text' as const, text: JSON.stringify(value)}]});

/** scope ограничивает агента разделом: в чате раздела и задачи чужие данные недоступны (FR-38). */
export function lifeboardServer(port: LifeboardPort, scope: {spaceId?: string}) {
    const space = (id?: string) => scope.spaceId ?? id;

    return createSdkMcpServer({
        name: 'lifeboard',
        version: '0.1.0',
        tools: [
            tool('find_tasks', 'Найти задачи владельца', {spaceId: z.string().optional(), text: z.string().optional(), overdue: z.boolean().optional()},
                async (a) => text(await port.findTasks({...a, spaceId: space(a.spaceId)})), {annotations: {readOnlyHint: true}}),
            tool('create_task', 'Завести задачу. Срок необязателен; для мелочей «чтобы не забыть» — приоритет zero',
                {spaceId: z.string(), title: z.string(), deadline: z.string().optional(), priority: PrioritySchema, firstStep: z.string().optional()},
                async (a) => text(await port.createTask({...a, spaceId: space(a.spaceId) ?? a.spaceId}))),
            tool('update_task', 'Изменить задачу: статус, срок, приоритет, первый шаг',
                {id: z.string(), patch: z.record(z.string(), z.unknown())}, async (a) => text(await port.updateTask(a.id, a.patch))),
            tool('allocate_slot', 'Выделить время под задачу в свободных часах до срока',
                {taskId: z.string(), minutes: z.number().int().positive().optional()}, async (a) => text(await port.allocateSlot(a.taskId, a.minutes))),
            tool('find_events', 'Найти события в календаре', {from: z.string(), to: z.string(), text: z.string().optional()},
                async (a) => text(await port.findEvents(a)), {annotations: {readOnlyHint: true}}),
            tool('move_event', 'Перенести событие; вернёт пересечения, если время занято (FR-34)',
                {id: z.string(), start: z.string(), end: z.string()}, async (a) => text(await port.moveEvent(a.id, a.start, a.end))),
            tool('delete_item', 'Удалить задачу или событие. Требует подтверждения владельца (FR-36)',
                {kind: z.enum(['task', 'event']), id: z.string()}, async (a) => text(await port.deleteItem(a.kind, a.id)),
                {annotations: {destructiveHint: true}}),
        ],
    });
}
