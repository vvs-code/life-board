import {z} from 'zod';

/**
 * Протокол раннера на машине владельца. WebSocket открывает раннер (соединение исходящее,
 * работает за NAT), авторизация токеном машины. См. SRS 3.10 и ARCHITECTURE 6.5.
 */
export const RunnerToServer = z.discriminatedUnion('type', [
    z.object({type: z.literal('hello'), machine: z.string(), version: z.string(), capacity: z.number().int().min(1)}),
    z.object({type: z.literal('run_event'), runId: z.string(), message: z.unknown()}),
    z.object({type: z.literal('ask_approval'), runId: z.string(), requestId: z.string(), action: z.string()}),
    z.object({type: z.literal('run_done'), runId: z.string(), ok: z.boolean(), costUsd: z.number()}),
    z.object({type: z.literal('pong')}),
]);
export type RunnerToServer = z.infer<typeof RunnerToServer>;

export const ServerToRunner = z.discriminatedUnion('type', [
    z.object({type: z.literal('task_assign'), runId: z.string(), prompt: z.string(), cwd: z.string()}),
    z.object({type: z.literal('approval'), requestId: z.string(), allow: z.boolean()}),
    z.object({type: z.literal('ping')}),
]);
export type ServerToRunner = z.infer<typeof ServerToRunner>;
