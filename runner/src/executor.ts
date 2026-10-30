import {query} from '@anthropic-ai/claude-agent-sdk';

const SAFE_TOOLS = new Set(['Read', 'Glob', 'Grep']);

/**
 * Локальный прогон: здесь, в отличие от сервера, встроенные тулы Read/Edit/Bash и есть смысл.
 * Всё, что меняет файлы или запускает команды, проходит через подтверждение владельца.
 * На своей машине владелец может пользоваться подпиской, на сервере нужен API-ключ.
 */
export async function execute(
    task: {runId: string; prompt: string; cwd: string},
    emit: (message: unknown) => void,
    askApproval: (action: string) => Promise<boolean>,
) {
    let costUsd = 0;
    let ok = false;
    for await (const message of query({
        prompt: task.prompt,
        options: {
            cwd: task.cwd,
            maxBudgetUsd: 2,
            canUseTool: async (toolName, input) => {
                if (SAFE_TOOLS.has(toolName)) return {behavior: 'allow', updatedInput: input};
                const allowed = await askApproval(`${toolName}: ${JSON.stringify(input).slice(0, 200)}`);
                return allowed ? {behavior: 'allow', updatedInput: input} : {behavior: 'deny', message: 'Не подтверждено'};
            },
        },
    })) {
        emit(message);
        if (message.type === 'result') {
            costUsd = message.total_cost_usd;
            ok = message.subtype === 'success';
        }
    }
    return {ok, costUsd};
}
