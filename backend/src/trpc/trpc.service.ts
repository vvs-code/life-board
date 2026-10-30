import {Injectable} from '@nestjs/common';
import {initTRPC, TRPCError} from '@trpc/server';
import superjson from 'superjson';
import type {TrpcContext} from './trpc.router.js';

/**
 * Уровни доступа процедур, как в solvehub:
 * procedure — без входа (вход, health); procedureWithSetup — мастер первого запуска по одноразовому токену (FR-2);
 * procedureWithAuth — всё остальное, только после входа по паролю (FR-4).
 */
@Injectable()
export class TrpcService {
    trpc = initTRPC.context<TrpcContext>().create({
        transformer: superjson,
        errorFormatter: ({shape, error}) =>
            error.code === 'INTERNAL_SERVER_ERROR' ? {...shape, message: 'Internal server error'} : shape,
    });

    router = this.trpc.router;
    procedure = this.trpc.procedure;

    procedureWithAuth = this.trpc.procedure.use(({ctx, next}) => {
        if (!ctx.sessionId) throw new TRPCError({code: 'UNAUTHORIZED'});
        return next({ctx: {...ctx, sessionId: ctx.sessionId}});
    });

    procedureWithSetup = this.trpc.procedure.use(({ctx, next}) => {
        if (!ctx.setupToken || ctx.setupToken !== process.env.SETUP_TOKEN) throw new TRPCError({code: 'FORBIDDEN'});
        return next();
    });
}
