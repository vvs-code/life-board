/** Агентный прогон: доменная сущность, а не техническая очередь (ARCHITECTURE, раздел 4). */
export type AgentRunKind = 'chat' | 'proactive' | 'machine';

export type AgentRunStatus =
    | 'queued'
    | 'running'
    | 'awaiting_approval'
    | 'done'
    | 'failed'
    | 'cancelled'
    | 'interrupted';

export type ChatLevel = 'core' | 'space' | 'task';

/** Прогон без heartbeat дольше этого считается брошенным (NFR-5). */
export const RUN_HEARTBEAT_TIMEOUT_MS = 2 * 60_000;
