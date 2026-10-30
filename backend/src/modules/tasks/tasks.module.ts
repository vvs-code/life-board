import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {TasksRouter} from './tasks.router.js';
import {TasksService} from './tasks.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [TasksService, TasksRouter],
    exports: [TasksService, TasksRouter],
})
export class TasksModule {}
