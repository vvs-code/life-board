import {Controller, Get, ServiceUnavailableException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service.js';

/** Раздельные liveness и readiness (NFR-14): /livez не трогает базу, /readyz проверяет базу и миграции. */
@Controller()
export class HealthController {
    static shuttingDown = false;

    constructor(private readonly prisma: PrismaService) {}

    @Get('livez')
    livez() {
        return {status: 'ok'};
    }

    @Get('readyz')
    async readyz() {
        if (HealthController.shuttingDown) throw new ServiceUnavailableException('shutting down');
        try {
            await this.prisma.$queryRaw`SELECT 1 FROM "_prisma_migrations" LIMIT 1`;
        } catch {
            throw new ServiceUnavailableException('database not ready');
        }
        return {status: 'ready'};
    }
}
