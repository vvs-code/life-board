/**
 * Расчёт свободного времени до срока (FR-20).
 * Рабочее окно минус занятые интервалы (события и подтверждённые слоты), но не больше нормы в день.
 * Всё в минутах от начала суток по местному времени: перевод из UTC делает вызывающий (NFR-12).
 */
export type Interval = {start: number; end: number};

export type DayPlan = {
    date: string;
    window: Interval | null;
    normMinutes: number;
    busy: Interval[];
    /** Сколько минут уже занято задачами в этот день: подтверждённые слоты. */
    plannedTaskMinutes: number;
};

export function subtract(window: Interval, busy: Interval[]): Interval[] {
    const sorted = [...busy].sort((a, b) => a.start - b.start);
    const free: Interval[] = [];
    let cursor = window.start;
    for (const b of sorted) {
        if (b.end <= cursor || b.start >= window.end) continue;
        if (b.start > cursor) free.push({start: cursor, end: Math.min(b.start, window.end)});
        cursor = Math.max(cursor, b.end);
        if (cursor >= window.end) break;
    }
    if (cursor < window.end) free.push({start: cursor, end: window.end});
    return free;
}

const length = (xs: Interval[]) => xs.reduce((sum, x) => sum + (x.end - x.start), 0);

/** Свободные минуты дня с учётом нормы: окно может быть шире, но работать больше нормы мы не планируем. */
export function freeMinutesOfDay(day: DayPlan): number {
    if (!day.window) return 0;
    const freeByCalendar = length(subtract(day.window, day.busy));
    const freeByNorm = Math.max(0, day.normMinutes - day.plannedTaskMinutes);
    return Math.min(freeByCalendar, freeByNorm);
}

export function freeMinutesUntil(days: DayPlan[]): number {
    return days.reduce((sum, day) => sum + freeMinutesOfDay(day), 0);
}
