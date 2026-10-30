import {NestFactory} from '@nestjs/core';
import {WsAdapter} from '@nestjs/platform-ws';
import {HealthController} from '@lifeboard/nest-common';
import cookieParser from 'cookie-parser';
import {AppModule} from './app.module.js';
import {TrpcRouter} from './trpc/trpc.router.js';

/**
 * backend: tRPC для веба, SSE-ретрансляция событий, WebSocket для раннеров.
 * Агентов сам не запускает: прогоны идут в workers, чтобы рестарт API их не рвал (NFR-5).
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useWebSocketAdapter(new WsAdapter(app));
    app.get(TrpcRouter).applyMiddleware(app);

    // По SIGTERM сначала выпадаем из readiness, затем дорабатываем текущие запросы (NFR-14).
    app.enableShutdownHooks(['SIGTERM', 'SIGINT']);
    process.once('SIGTERM', () => {
        HealthController.shuttingDown = true;
    });

    await app.listen(Number(process.env.PORT ?? 3000));
}

void bootstrap();
