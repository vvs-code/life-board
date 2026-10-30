import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Каталог MCP-модулей из modules/<id>/module.json. После MVP. Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class ModulesCatalogService {
    constructor(private readonly prisma: PrismaService) {}

    /** встроенные модули с тумблером и формой настроек из манифеста */
    async list(): Promise<unknown> {
        throw new NotImplementedException('modules-catalog.list');
    }

    async toggle(input: unknown): Promise<unknown> {
        throw new NotImplementedException('modules-catalog.toggle');
    }
}
