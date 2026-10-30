import {SettingsSchema} from '@lifeboard/common';
import {Injectable} from '@nestjs/common';
import {TrpcService} from '../../trpc/trpc.service.js';
import {SettingsService} from './settings.service.js';

/** Все настройки в вебе, без перезапуска (FR-41). Роутер без логики: валидация входа zod-схемой и вызов сервиса. */
@Injectable()
export class SettingsRouter {
    public readonly router;

    constructor(trpcService: TrpcService, settingsService: SettingsService) {
        this.router = trpcService.router({
            get: trpcService.procedureWithAuth
                .query(() => settingsService.get()),
            update: trpcService.procedureWithAuth
                .input(SettingsSchema.partial())
                .mutation(({input}) => settingsService.update(input)),
        });
    }
}
