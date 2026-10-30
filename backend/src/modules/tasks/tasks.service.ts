import {Injectable, NotImplementedException} from '@nestjs/common';
import {PrismaService} from '@lifeboard/nest-common';

/** Задачи: срок, приоритет, первый шаг, статус (FR-11, FR-12, FR-14). Вся бизнес-логика модуля живёт здесь, роутер только вызывает методы. */
@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}

    /** сортировка: приоритет, затем срок, без срока в конце */
    async list(input: unknown): Promise<unknown> {
        throw new NotImplementedException('tasks.list');
    }

    async get(input: unknown): Promise<unknown> {
        throw new NotImplementedException('tasks.get');
    }

    /** сразу ставит задачу на оценку длительности моделью (FR-21) */
    async create(input: unknown): Promise<unknown> {
        throw new NotImplementedException('tasks.create');
    }

    /** ручная оценка помечается owner и больше не перезаписывается */
    async update(input: unknown): Promise<unknown> {
        throw new NotImplementedException('tasks.update');
    }

    async remove(input: unknown): Promise<unknown> {
        throw new NotImplementedException('tasks.remove');
    }
}
