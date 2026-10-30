import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {ModulesCatalogRouter} from './modulesCatalog.router.js';
import {ModulesCatalogService} from './modulesCatalog.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [ModulesCatalogService, ModulesCatalogRouter],
    exports: [ModulesCatalogService, ModulesCatalogRouter],
})
export class ModulesCatalogModule {}
