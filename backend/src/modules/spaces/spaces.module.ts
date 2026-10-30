import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {SpacesRouter} from './spaces.router.js';
import {SpacesService} from './spaces.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [SpacesService, SpacesRouter],
    exports: [SpacesService, SpacesRouter],
})
export class SpacesModule {}
