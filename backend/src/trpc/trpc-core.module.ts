import {Global, Module} from '@nestjs/common';
import {TrpcService} from './trpc.service.js';

@Global()
@Module({providers: [TrpcService], exports: [TrpcService]})
export class TrpcCoreModule {}
