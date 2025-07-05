import type { Static } from "elysia";
import { PublicCard } from "$shared/models/public_card";
import { t } from "elysia";

export const CardDTO = t.Object({
  id: t.String({ uuid: true }),
  name: t.String({ minLength: 2, maxLength: 32 }),
  description: t.String({ minLength: 2, maxLength: 256 }),
  imageUrl: t.String({ url: true }),
  deckId: t.String({ uuid: true }),
});

export type Card = Static<typeof CardDTO>;

export function serializeCardForClient(card: Card): PublicCard {
  return {
    id: card.id,
    name: card.name,
    // description: card.description,
    imageUrl: card.imageUrl,
    // deckId: card.deckId,
  };
}
