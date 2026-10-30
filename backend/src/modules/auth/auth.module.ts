import {Module} from '@nestjs/common';
import {TrpcCoreModule} from '../../trpc/trpc-core.module.js';
import {AuthRouter} from './auth.router.js';
import {AuthService} from './auth.service.js';

@Module({
    imports: [TrpcCoreModule],
    providers: [AuthService, AuthRouter],
    exports: [AuthService, AuthRouter],
})
export class AuthModule {}
