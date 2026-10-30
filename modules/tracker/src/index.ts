import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

/** Модуль рабочего трекера: инструменты доступны только агенту разделов, к которым он привязан. */
const server = new McpServer({name: 'tracker', version: '0.1.0'});

server.tool('list_my_issues', 'Мои открытые задачи со сроками', {}, async () => {
    // TODO: запрос к API трекера с токеном из настроек модуля
    return {content: [{type: 'text', text: '[]'}]};
});

server.tool('list_review_requests', 'Пулл-реквесты, ждущие моего ревью', {}, async () => {
    return {content: [{type: 'text', text: '[]'}]};
});

server.tool('get_issue', 'Подробности задачи', {key: z.string()}, async ({key}) => {
    return {content: [{type: 'text', text: JSON.stringify({key})}]};
});

await server.connect(new StdioServerTransport());
