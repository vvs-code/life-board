'use client';
import {ThemeProvider} from '@gravity-ui/uikit';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {type ReactNode, useState} from 'react';
import {trpc, trpcLinks} from '../api/trpc';

export function Providers({children}: {children: ReactNode}) {
    const [queryClient] = useState(() => new QueryClient());
    const [client] = useState(() => trpc.createClient({links: trpcLinks}));
    return (
        <trpc.Provider client={client} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme="system">{children}</ThemeProvider>
            </QueryClientProvider>
        </trpc.Provider>
    );
}
