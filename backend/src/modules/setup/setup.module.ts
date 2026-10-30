import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {SetupRouter} from './setup.router.js';
import {SetupService} from './setup.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [SetupService, SetupRouter],
    exports: [SetupService, SetupRouter],
})
export class SetupModule {}
