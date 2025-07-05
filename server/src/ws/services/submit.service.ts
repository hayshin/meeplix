import { Submit } from "../models/submit.model";
import { Player } from "$shared/models/player";
import { Card } from "../models/card.model";

export function hasPlayer(submits: Submit[], playerId: string) {
  return submits.some((submit) => submit.playerId === playerId);
}

export function hasCard(submits: Submit[], cardId: string) {
  return submits.some((submit) => submit.card.id === cardId);
}
