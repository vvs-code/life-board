import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {ChatsRouter} from './chats.router.js';
import {ChatsService} from './chats.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [ChatsService, ChatsRouter],
    exports: [ChatsService, ChatsRouter],
})
export class ChatsModule {}
