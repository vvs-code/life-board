import type {Priority} from '../schemas/task.js';
import {type DayPlan, type Interval, freeMinutesOfDay, subtract} from './free-time.js';

export type ProposedSlot = {date: string} & Interval;

export type Allocation = {
    slots: ProposedSlot[];
    /** Сколько минут не хватило до оценки: если > 0, система называет дефицит (FR-22). */
    missingMinutes: number;
};

const MIN_SLOT_MINUTES = 30;

/**
 * Раскладка слотов под задачу по кнопке «Выделить слот» (FR-22).
 * Нулевой приоритет автоматически не планируется, низкий оставляет запас до нормы (FR-26, BR-1, BR-4).
 * Слоты ставятся с ближайших дней, чтобы оставить запас перед сроком.
 */
export function allocateSlots(
    days: DayPlan[],
    needMinutes: number,
    priority: Priority,
    lowPriorityReserveMinutes: number,
): Allocation {
    if (priority === 'zero') return {slots: [], missingMinutes: needMinutes};

    const slots: ProposedSlot[] = [];
    let left = needMinutes;

    for (const day of days) {
        if (left <= 0 || !day.window) continue;
        const reserve = priority === 'low' ? lowPriorityReserveMinutes : 0;
        let budget = freeMinutesOfDay(day) - reserve;
        if (budget < MIN_SLOT_MINUTES) continue;

        for (const gap of subtract(day.window, day.busy)) {
            if (left <= 0 || budget < MIN_SLOT_MINUTES) break;
            const take = Math.min(gap.end - gap.start, left, budget);
            if (take < MIN_SLOT_MINUTES) continue;
            slots.push({date: day.date, start: gap.start, end: gap.start + take});
            left -= take;
            budget -= take;
        }
    }

    return {slots, missingMinutes: Math.max(0, left)};
}
