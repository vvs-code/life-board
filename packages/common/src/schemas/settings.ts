import {z} from 'zod';

const Time = z.string().regex(/^\d{2}:\d{2}$/);

/** Рабочее окно по дням недели и норма часов (FR-19). Окно шире нормы намеренно. */
export const WorkDaySchema = z.object({
    enabled: z.boolean(),
    from: Time,
    to: Time,
    normHours: z.number().min(0).max(16),
});

export const SettingsSchema = z.object({
    timezone: z.string(),
    week: z.array(WorkDaySchema).length(7),
    /** Запас до нормы для задач низкого приоритета, в минутах (BR-4). */
    lowPriorityReserveMinutes: z.number().int().default(60),
    /** Сколько дней без движения считается «забытой» задачей (BR-5). */
    staleAfterDays: z.number().int().default(5),
    /** Лимит задач в одном сообщении (FR-29). */
    digestLimit: z.number().int().min(1).max(10).default(3),
    digestTime: Time.default('09:00'),
    persistence: z.enum(['soft', 'normal', 'firm']).default('normal'),
    runBudgetUsd: z.number().positive().default(0.2),
});
export type Settings = z.infer<typeof SettingsSchema>;

/** Исключение рабочего окна на конкретную дату перекрывает правило дня недели. */
export const DayOverrideSchema = WorkDaySchema.extend({date: z.string().date()});
export type DayOverride = z.infer<typeof DayOverrideSchema>;
