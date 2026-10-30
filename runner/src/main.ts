import {randomUUID} from 'node:crypto';
import {RunnerToServer, ServerToRunner} from '@lifeboard/common';
import WebSocket from 'ws';
import {execute} from './executor.js';

/**
 * Раннер на машине владельца: агент там, где файлы (ARCHITECTURE 6.5, после MVP).
 * Соединение исходящее — работает за NAT, без проброса портов. Машина выключена — задача ждёт в очереди.
 * Конфиг руками не правится: адрес и токен выдаёт команда регистрации из веба.
 */
const SERVER = process.env.LIFEBOARD_URL ?? 'wss://life.example.com/runner';
const TOKEN = process.env.LIFEBOARD_MACHINE_TOKEN ?? '';
const CAPACITY = Number(process.env.LIFEBOARD_CAPACITY ?? 2);

const pendingApprovals = new Map<string, (allow: boolean) => void>();

function connect() {
    const ws = new WebSocket(SERVER, {headers: {authorization: `Bearer ${TOKEN}`}});
    const send = (msg: RunnerToServer) => ws.send(JSON.stringify(msg));

    ws.on('open', () => send({type: 'hello', machine: process.env.HOSTNAME ?? 'laptop', version: '0.1.0', capacity: CAPACITY}));

    ws.on('message', async (raw) => {
        const msg = ServerToRunner.parse(JSON.parse(raw.toString()));
        if (msg.type === 'ping') return send({type: 'pong'});
        if (msg.type === 'approval') return pendingApprovals.get(msg.requestId)?.(msg.allow);

        // Необратимое действие на машине: вопрос владельцу уходит через сервер в Telegram.
        const askApproval = (action: string) =>
            new Promise<boolean>((resolve) => {
                const requestId = randomUUID();
                pendingApprovals.set(requestId, resolve);
                send({type: 'ask_approval', runId: msg.runId, requestId, action});
            });

        const result = await execute(msg, (message) => send({type: 'run_event', runId: msg.runId, message}), askApproval);
        send({type: 'run_done', runId: msg.runId, ok: result.ok, costUsd: result.costUsd});
    });

    // Разрыв — переподключаемся; незавершённые прогоны сервер пометит interrupted.
    ws.on('close', () => setTimeout(connect, 5_000));
}

connect();
