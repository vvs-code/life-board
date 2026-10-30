import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Разделы жизни; «Жизнь» удалить нельзя (FR-9, FR-10). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class SpacesService {
    constructor(private readonly prisma: PrismaService) {}

    async list(): Promise<unknown> {
        throw new NotImplementedException('spaces.list');
    }

    /** создаёт календари «[Раздел]» и «[Раздел]: Таски» (FR-15) */
    async create(input: unknown): Promise<unknown> {
        throw new NotImplementedException('spaces.create');
    }

    /** переименование и цвет уходят в оба календаря (FR-16) */
    async update(input: unknown): Promise<unknown> {
        throw new NotImplementedException('spaces.update');
    }

    /** для системного раздела CONFLICT */
    async remove(input: unknown): Promise<unknown> {
        throw new NotImplementedException('spaces.remove');
    }
}
