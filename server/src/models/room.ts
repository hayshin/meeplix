import { Static, t } from "elysia";
import { PlayersDTO } from "$shared/models/player";
import { CardDTO, CardsDTO, serializeCardForClient } from "./card";
import { VotesDTO } from "$shared/models/vote";
import { PublicRoomState } from "$shared/models/public_room";
import { PublicCards } from "$shared/models/public_card";

export const HandDTO = t.Object({
  playerId: t.String(),
  cards: CardsDTO,
});

export const SubmittedCardDTO = t.Object({
  playerId: t.String(),
  card: CardDTO,
});

export type SubmittedCard = Static<typeof SubmittedCardDTO>;

export function serializeSubmittedCards(submits: SubmittedCard[]): PublicCards {
  return submits.map((card) => {
    return serializeCardForClient(card.card);
  });
}

export const RoomPhaseSchema = t.Union([
  t.Literal("joining"),
  t.Literal("leader_choosing"),
  t.Literal("players_choosing"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);

export const RoomStateDTO = t.Object({
  id: t.String(),
  players: PlayersDTO,
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  submittedCards: t.Array(SubmittedCardDTO),
  stage: RoomPhaseSchema,
  votes: VotesDTO,

  hands: HandDTO,
});
export type RoomState = Static<typeof RoomStateDTO>;

export function serializeRoomState(roomState: RoomState): PublicRoomState {
  return {
    id: roomState.id,
    players: roomState.players,
    roundNumber: roomState.roundNumber,
    leaderId: roomState.leaderId,
    currentDescription: roomState.currentDescription,
    submittedCards: serializeSubmittedCards(roomState.submittedCards),
    stage: roomState.stage,
    votes: roomState.votes,
  };
}
