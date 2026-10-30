import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {PlanningRouter} from './planning.router.js';
import {PlanningService} from './planning.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [PlanningService, PlanningRouter],
    exports: [PlanningService, PlanningRouter],
})
export class PlanningModule {}
