import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {SettingsRouter} from './settings.router.js';
import {SettingsService} from './settings.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [SettingsService, SettingsRouter],
    exports: [SettingsService, SettingsRouter],
})
export class SettingsModule {}
