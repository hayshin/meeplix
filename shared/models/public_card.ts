import type { Static } from "elysia";
import { t } from "elysia";

export const PublicCardDTO = t.Object({
  id: t.String({ uuid: true }),
  name: t.String({ minLength: 2, maxLength: 32 }),
  // description: t.String({ minLength: 2, maxLength: 256 }),
  // imageUrl: t.String({ url: true }),
  // deckId: t.String({ uuid: true }),
});

export type PublicCard = Static<typeof PublicCardDTO>;
