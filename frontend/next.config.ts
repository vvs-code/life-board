import type {NextConfig} from 'next';

// Браузер ходит в один origin: Caddy отдаёт /trpc, /events и /runner бэкенду, остальное — Next.js.
const config: NextConfig = {
    output: 'standalone',
    transpilePackages: ['@gravity-ui/uikit', '@lifeboard/common'],
};

export default config;
