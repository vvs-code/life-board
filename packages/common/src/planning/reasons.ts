import {PRIORITY_WEIGHT, type Priority} from '../schemas/task.js';

/**
 * Поводы написать владельцу (FR-28). Их определяют детерминированные правила,
 * модель только формулирует текст (BR-6). Тик без повода к модели не обращается (FR-27).
 */
export type ReasonKind = 'not_enough_time' | 'stale' | 'no_slot';

export type TaskSnapshot = {
    id: string;
    priority: Priority;
    deadline: Date | null;
    estimateMinutes: number | null;
    freeMinutesUntilDeadline: number;
    hasSlot: boolean;
    lastMovedAt: Date;
    snoozedUntil: Date | null;
};

export type Reason = {taskId: string; kind: ReasonKind; priority: Priority; deadline: Date | null};

const DAY = 24 * 60 * 60 * 1000;

export function findReasons(
    tasks: TaskSnapshot[],
    now: Date,
    opts: {staleAfterDays: number; lowPriorityReserveMinutes: number},
): Reason[] {
    const reasons: Reason[] = [];
    for (const t of tasks) {
        // Нулевой приоритет никогда не напоминает, отложенные молчат до срока (FR-32, FR-33).
        if (t.priority === 'zero') continue;
        if (t.snoozedUntil && t.snoozedUntil > now) continue;

        const need = t.estimateMinutes ?? 0;
        const reserve = t.priority === 'low' ? opts.lowPriorityReserveMinutes : 0;
        const base = {taskId: t.id, priority: t.priority, deadline: t.deadline};

        if (t.deadline && need > 0 && t.freeMinutesUntilDeadline - reserve < need) {
            // Низкий приоритет напоминает только при запасе времени (FR-32).
            if (t.priority !== 'low') reasons.push({...base, kind: 'not_enough_time'});
            continue;
        }
        if (t.deadline && !t.hasSlot) {
            reasons.push({...base, kind: 'no_slot'});
            continue;
        }
        if (now.getTime() - t.lastMovedAt.getTime() > opts.staleAfterDays * DAY) {
            reasons.push({...base, kind: 'stale'});
        }
    }
    return reasons;
}

/** Выбор пунктов для одного сообщения: приоритет, затем близость срока, не больше лимита (FR-29, BR-5). */
export function pickForDigest(reasons: Reason[], limit: number): Reason[] {
    return [...reasons]
        .sort(
            (a, b) =>
                PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority] ||
                (a.deadline?.getTime() ?? Number.POSITIVE_INFINITY) - (b.deadline?.getTime() ?? Number.POSITIVE_INFINITY),
        )
        .slice(0, limit);
}
