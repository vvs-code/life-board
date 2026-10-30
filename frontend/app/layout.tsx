import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import type {ReactNode} from 'react';
import {Providers} from '../src/shared/ui/Providers';

export default function RootLayout({children}: {children: ReactNode}) {
    return (
        <html lang="ru">
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
