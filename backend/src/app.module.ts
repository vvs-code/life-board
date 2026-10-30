import {Module} from '@nestjs/common';
import {HealthController, NotifyService, PrismaModule, SecretsService} from '@lifeboard/nest-common';
import {AuthModule} from './modules/auth/auth.module.js';
import {SetupModule} from './modules/setup/setup.module.js';
import {SpacesModule} from './modules/spaces/spaces.module.js';
import {TasksModule} from './modules/tasks/tasks.module.js';
import {PlanningModule} from './modules/planning/planning.module.js';
import {ChatsModule} from './modules/chats/chats.module.js';
import {SettingsModule} from './modules/settings/settings.module.js';
import {ModulesCatalogModule} from './modules/modules-catalog/modulesCatalog.module.js';
import {EventsStreamController} from './modules/events-stream/events-stream.controller.js';
import {RunnerGateway} from './modules/runner-gateway/runner.gateway.js';
import {TrpcCoreModule} from './trpc/trpc-core.module.js';
import {TrpcRouter} from './trpc/trpc.router.js';

@Module({
    imports: [PrismaModule, TrpcCoreModule, AuthModule, SetupModule, SpacesModule, TasksModule, PlanningModule, ChatsModule, SettingsModule, ModulesCatalogModule],
    controllers: [HealthController, EventsStreamController],
    providers: [TrpcRouter, NotifyService, SecretsService, RunnerGateway],
})
export class AppModule {}
