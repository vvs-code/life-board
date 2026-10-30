import {query} from '@anthropic-ai/claude-agent-sdk';
import {buildQueryOptions, confirmDestructive, lifeboardServer, spaceAgents} from '@lifeboard/agent';
import {chatChannel, RUN_HEARTBEAT_TIMEOUT_MS} from '@lifeboard/common';
import {Injectable} from '@nestjs/common';
import {Interval} from '@nestjs/schedule';
import {NotifyService, PrismaService} from '@lifeboard/nest-common';

/**
 * Агентные прогоны живут в workers (ARCHITECTURE 6.1): backend только ставит agent_run.
 * Разбор очереди через SKIP LOCKED; каждое сообщение агента сначала в message, потом pg_notify → SSE.
 * Прогон без heartbeat дольше 2 минут переводится в interrupted (NFR-5).
 */
@Injectable()
export class AgentRunsConsumer {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notify: NotifyService,
    ) {}

    @Interval(1_000)
    async poll() {
        const [run] = await this.prisma.$queryRaw<{id: string; chatId: string | null; prompt: string}[]>`
            UPDATE "AgentRun" SET status = 'running', "startedAt" = now(), "heartbeatAt" = now()
            WHERE id = (
                SELECT id FROM "AgentRun"
                WHERE status = 'queued' AND kind IN ('chat', 'proactive')
                ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT 1
            )
            RETURNING id, "chatId", prompt`;
        if (run) await this.execute(run);
    }

    @Interval(30_000)
    async reapAbandoned() {
        await this.prisma.agentRun.updateMany({
            where: {status: 'running', heartbeatAt: {lt: new Date(Date.now() - RUN_HEARTBEAT_TIMEOUT_MS)}},
            data: {status: 'interrupted'},
        });
    }

    private async execute(run: {id: string; chatId: string | null; prompt: string}) {
        const spaces = await this.prisma.space.findMany();
        const options = buildQueryOptions({
            scope: {level: 'core'}, // TODO: уровень, раздел и session_id берутся из chat
            agents: spaceAgents(spaces.map((s) => ({id: s.id, name: s.name, description: ''})), []),
            mcpServers: {lifeboard: lifeboardServer(/* TODO: порт к сервисам */ {} as never, {})},
            canUseTool: confirmDestructive(async () => false), // TODO: вопрос в Telegram, ожидание ответа
            budgetUsd: 0.2,
        });

        for await (const message of query({prompt: run.prompt, options})) {
            await this.prisma.agentRun.update({where: {id: run.id}, data: {heartbeatAt: new Date()}});
            if (!run.chatId) continue;
            await this.prisma.message.create({data: {chatId: run.chatId, role: message.type, content: message as object}});
            await this.notify.publish(chatChannel(run.chatId), message);
            if (message.type === 'result') {
                await this.prisma.agentRun.update({
                    where: {id: run.id},
                    data: {status: message.subtype === 'success' ? 'done' : 'failed', costUsd: message.total_cost_usd, finishedAt: new Date()},
                });
            }
        }
    }
}
