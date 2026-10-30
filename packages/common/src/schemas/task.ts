import {z} from 'zod';

/**
 * Приоритет задаёт поведение задачи (BR-1):
 * zero — «чтобы не забыть»: не планируется и не напоминает;
 * low — планируется и напоминает только при запасе времени;
 * mid, high — жёсткий срок.
 */
export const PrioritySchema = z.enum(['zero', 'low', 'mid', 'high']);
export type Priority = z.infer<typeof PrioritySchema>;

export const PRIORITY_WEIGHT: Record<Priority, number> = {zero: 0, low: 1, mid: 2, high: 3};

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done']);

export const TaskSchema = z.object({
    id: z.string().uuid(),
    spaceId: z.string().uuid(),
    title: z.string().min(1).max(200),
    description: z.string().max(10_000).default(''),
    deadline: z.coerce.date().nullable(),
    priority: PrioritySchema,
    status: TaskStatusSchema,
    /** Действие минут на пять, с которого проще начать (FR-11, FR-30). */
    firstStep: z.string().max(200).nullable(),
    /** Оценка длительности в минутах: сначала от модели, потом можно поправить руками (FR-21). */
    estimateMinutes: z.number().int().positive().nullable(),
    estimateSource: z.enum(['ai', 'owner']).nullable(),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskCreateSchema = TaskSchema.pick({
    spaceId: true,
    title: true,
    description: true,
    deadline: true,
    priority: true,
    firstStep: true,
}).partial({description: true, deadline: true, firstStep: true});

export const TaskPatchSchema = TaskCreateSchema.partial().extend({
    status: TaskStatusSchema.optional(),
    estimateMinutes: z.number().int().positive().optional(),
});
