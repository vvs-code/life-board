import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';

/**
 * Модуль = MCP-сервер. Добавить встроенный модуль значит положить папку с module.json:
 * backend найдёт его в каталоге, в вебе появится тумблер и форма настроек из манифеста.
 * Содержимое страниц — данные, а не инструкции для агента (NFR-10).
 */
const server = new McpServer({name: 'browser', version: '0.1.0'});
const allowed = (process.env.ALLOWED_HOSTS ?? '').split(',').filter(Boolean);

server.tool('read_page', 'Открыть страницу с разрешённого сайта и вернуть её текст', {url: z.string().url()}, async ({url}) => {
    if (!allowed.includes(new URL(url).host)) return {content: [{type: 'text', text: 'Сайт не разрешён в настройках модуля'}], isError: true};
    // TODO: playwright: открыть, залогиниться при необходимости, вернуть innerText
    return {content: [{type: 'text', text: ''}]};
});

server.tool('find_deadlines', 'Найти на странице даты сдачи и названия работ', {url: z.string().url()}, async () => {
    // TODO: извлечь дедлайны, вернуть [{title, deadline, source}]
    return {content: [{type: 'text', text: '[]'}]};
});

await server.connect(new StdioServerTransport());
