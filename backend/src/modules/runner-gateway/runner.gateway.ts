import {type OnGatewayConnection, type OnGatewayDisconnect, WebSocketGateway} from '@nestjs/websockets';
import {RunnerToServer, type ServerToRunner} from '@lifeboard/common';
import type {IncomingMessage} from 'node:http';
import type WebSocket from 'ws';

/**
 * Приём раннеров с машин владельца (ARCHITECTURE 6.5, после MVP).
 * Соединение исходящее со стороны машины; сервер шлёт задачи, пока не упрётся в объявленную ёмкость.
 * Разрыв: машина offline, её незавершённые прогоны переходят в interrupted.
 */
@WebSocketGateway({path: '/runner'})
export class RunnerGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly machines = new Map<WebSocket, {name: string; capacity: number; running: number}>();

    handleConnection(socket: WebSocket, req: IncomingMessage) {
        const token = req.headers.authorization?.replace(/^Bearer /, '');
        if (!token) return socket.close(4401, 'machine token required');
        // TODO: сверить хэш токена с таблицей Machine, отклонить отозванный.

        socket.on('message', (raw) => {
            const msg = RunnerToServer.parse(JSON.parse(raw.toString()));
            switch (msg.type) {
                case 'hello':
                    this.machines.set(socket, {name: msg.machine, capacity: msg.capacity, running: 0});
                    break;
                case 'run_event':
                    // TODO: INSERT message + pg_notify(chat:<id>), как у прогонов в workers.
                    break;
                case 'ask_approval':
                    // TODO: вопрос владельцу в Telegram, ответ вернуть сообщением approval.
                    break;
                case 'run_done':
                    // TODO: статус прогона done/failed, стоимость, освободить ёмкость.
                    break;
            }
        });
    }

    handleDisconnect(socket: WebSocket) {
        this.machines.delete(socket);
        // TODO: незавершённые прогоны этой машины перевести в interrupted.
    }

    send(socket: WebSocket, msg: ServerToRunner) {
        socket.send(JSON.stringify(msg));
    }
}
