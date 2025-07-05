import { Static, t } from "elysia";
import { CardDTO, serializeCardForClient } from "./card.model";
import { PublicCard } from "$shared/models/public_card";
import { Player } from "$shared/models/player";
import { Card } from "../models/card.model";

export const SubmitDTO = t.Object({
  playerId: t.String(),
  card: CardDTO,
});

export type Submit = Static<typeof SubmitDTO>;

export function serializeSubmittedCards(submits: Submit[]): PublicCard[] {
  return submits.map((card) => {
    return serializeCardForClient(card.card);
  });
}

export function createSubmit(player: Player, card: Card): Submit {
  return {
    playerId: player.id,
    card,
  };
}
