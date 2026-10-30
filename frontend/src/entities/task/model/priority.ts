import type {Priority} from '@lifeboard/common';

export const PRIORITY_LABEL: Record<Priority, string> = {
    high: 'Высокий',
    mid: 'Средний',
    low: 'Низкий',
    zero: 'Чтобы не забыть',
};

export const PRIORITY_THEME: Record<Priority, 'danger' | 'warning' | 'info' | 'unknown'> = {
    high: 'danger',
    mid: 'warning',
    low: 'info',
    zero: 'unknown',
};
