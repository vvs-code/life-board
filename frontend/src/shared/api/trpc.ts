import type {AppRouter} from '@lifeboard/backend/src/trpc/trpc.router';
import {createTRPCProxyClient, httpBatchLink} from '@trpc/client';
import {createTRPCReact} from '@trpc/react-query';
import superjson from 'superjson';

/** Сквозная типизация без кодогенерации: тип роутера импортируется из backend, как в solvehub. */
export const trpc = createTRPCReact<AppRouter>();

export const trpcLinks = [httpBatchLink({url: '/trpc', transformer: superjson})];

/** Клиент для серверных компонентов Next.js. */
export const serverTrpc = createTRPCProxyClient<AppRouter>({
    links: [httpBatchLink({url: `${process.env.BACKEND_INTERNAL_URL ?? 'http://backend:3000'}/trpc`, transformer: superjson})],
});
