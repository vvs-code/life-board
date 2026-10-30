import {Module} from '@nestjs/common';
import {ScheduleModule} from '@nestjs/schedule';
import {NotifyService, PrismaModule, SecretsService} from '@lifeboard/nest-common';
import {AgentRunsConsumer} from './agent-runs/agent-runs.consumer.js';
import {CalDavSyncJob} from './caldav/caldav-sync.job.js';
import {ProactiveTickJob} from './proactive/proactive-tick.job.js';
import {QueueService} from './queue/queue.service.js';
import {TelegramBot} from './telegram/telegram.bot.js';

@Module({
    imports: [PrismaModule, ScheduleModule.forRoot()],
    providers: [NotifyService, SecretsService, QueueService, TelegramBot, CalDavSyncJob, ProactiveTickJob, AgentRunsConsumer],
})
export class WorkerModule {}
