import type {CanUseTool} from '@anthropic-ai/claude-agent-sdk';

/** Встроенные тулы Claude Code на сервере выключены: у агента нет доступа к файлам и шеллу хоста (NFR-9). */
export const SERVER_DISALLOWED_TOOLS = ['Bash', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebFetch', 'NotebookEdit'];

const DESTRUCTIVE = new Set(['mcp__lifeboard__delete_item']);

/**
 * Необратимые действия проходят через подтверждение владельца (FR-36):
 * вопрос уходит в Telegram или в чат, прогон ждёт в статусе awaiting_approval.
 */
export function confirmDestructive(ask: (tool: string, input: unknown) => Promise<boolean>): CanUseTool {
    return async (toolName, input) => {
        if (!DESTRUCTIVE.has(toolName)) return {behavior: 'allow', updatedInput: input};
        const allowed = await ask(toolName, input);
        return allowed
            ? {behavior: 'allow', updatedInput: input}
            : {behavior: 'deny', message: 'Владелец не подтвердил действие'};
    };
}
