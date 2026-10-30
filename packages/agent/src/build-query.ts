import type {AgentDefinition, CanUseTool, McpServerConfig, Options} from '@anthropic-ai/claude-agent-sdk';
import type {ChatLevel} from '@lifeboard/common';
import {SERVER_DISALLOWED_TOOLS} from './permissions.js';

export type ChatScope = {
    level: ChatLevel;
    /** Ключ субагента раздела, для чатов раздела и задачи. */
    spaceAgent?: string;
    taskContext?: string;
    sessionId?: string | null;
};

/**
 * Опции запуска агента по уровню чата (ARCHITECTURE 6.1):
 * общий — core делегирует разделам; раздел — главный поток сразу агент раздела;
 * задача — то же плюс контекст задачи. Новое сообщение в чате — resume по session_id.
 */
export function buildQueryOptions(params: {
    scope: ChatScope;
    agents: Record<string, AgentDefinition>;
    mcpServers: Record<string, McpServerConfig>;
    canUseTool: CanUseTool;
    budgetUsd: number;
}): Options {
    const {scope, budgetUsd} = params;
    const agents = {...params.agents};

    if (scope.level === 'task' && scope.spaceAgent && scope.taskContext) {
        const base = agents[scope.spaceAgent];
        if (base) agents[scope.spaceAgent] = {...base, prompt: `${base.prompt}\n\nОбсуждаем задачу:\n${scope.taskContext}`};
    }

    return {
        agent: scope.level === 'core' ? undefined : scope.spaceAgent,
        agents,
        mcpServers: params.mcpServers,
        allowedTools: ['mcp__lifeboard__*', 'Agent'],
        disallowedTools: SERVER_DISALLOWED_TOOLS,
        canUseTool: params.canUseTool,
        resume: scope.sessionId ?? undefined,
        maxBudgetUsd: budgetUsd, // потолок стоимости прогона (NFR-11)
        maxTurns: 20,
        persistSession: false, // транскрипт пишем сами в Postgres, чтобы показывать в вебе
        env: {
            ...process.env,
            CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH: '1',
            CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS: '3',
        },
    };
}
