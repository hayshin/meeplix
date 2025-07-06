import { Static, t } from "elysia";
import { Card, CardDTO } from "./card";
import { shuffle } from "../services/card.service";

export const HandDTO = t.Object({
  playerId: t.String(),
  cards: t.Array(CardDTO),
});

export type Hand = Static<typeof HandDTO>;

export function createHand(deck: Card[], size: number, playerId: string): Hand {
  const cards = shuffle(deck).slice(0, size);
  return {
    playerId,
    cards,
  };
}
