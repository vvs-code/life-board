import {z} from 'zod';

// Раздел жизни: «Жизнь» создаётся при установке и не удаляется (FR-10).
export const LIFE_SPACE_NAME = 'Жизнь';

export const SpaceSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(64),
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
    isSystem: z.boolean(),
});
export type Space = z.infer<typeof SpaceSchema>;

export const SpaceCreateSchema = SpaceSchema.pick({name: true, color: true});
export const SpacePatchSchema = SpaceCreateSchema.partial();

/** Календари раздела на CalDAV-сервере (FR-15, BR-8). */
export const calendarNames = (spaceName: string) => ({
    events: spaceName,
    tasks: `${spaceName}: Таски`,
});
