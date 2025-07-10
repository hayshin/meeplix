import { Static, t } from "elysia";
import { v4 as uuidv4 } from "uuid";
import { PlayerDTO, Player } from "$shared/models/player";
import { CardDTO, Card, serializeCardForClient } from "./card.model";
import { HandDTO, Hand } from "./hand.model";
import { VoteDTO, Vote } from "$shared/models/vote";
import { PublicRoomState } from "$shared/models/public_room";
import { Submit, SubmitDTO, serializeSubmittedCards } from "./submit.model";
import { getPlayersInRoom } from "../services/room.service";

export const RoomPhaseDTO = t.Union([
  t.Literal("joining"),
  t.Literal("leader_submitting"),
  t.Literal("players_submitting"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);
export type RoomPhase = Static<typeof RoomPhaseDTO>;

export const RoomStateDTO = t.Object({
  id: t.String(),
  deck: t.Array(CardDTO),
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  submittedCards: t.Array(SubmitDTO),
  phase: RoomPhaseDTO,
  votes: t.Array(VoteDTO),
  hands: t.Array(HandDTO),
});
export type RoomState = Static<typeof RoomStateDTO>;

export function createRoomState(
  id: string,
  deck: Card[],
  roundNumber: number,
  leaderId: string,
  currentDescription: string,
  submittedCards: Submit[],
  stage: RoomPhase,
  votes: Vote[],
  hands: Hand[],
): RoomState {
  return {
    id,
    deck,
    roundNumber,
    leaderId,
    currentDescription,
    submittedCards,
    phase: stage,
    votes,
    hands,
  };
}
export function createEmptyRoomState(id: string): RoomState {
  return {
    id,
    deck: [],
    roundNumber: 0,
    leaderId: "",
    currentDescription: "",
    submittedCards: [],
    phase: "joining",
    votes: [],
    hands: [],
  };
}

export function serializeRoomState(room: RoomState): PublicRoomState {
  const players = getPlayersInRoom(room.id);
  return {
    id: room.id,
    roundNumber: room.roundNumber,
    leaderId: room.leaderId,
    currentDescription: room.currentDescription,
    submittedCards: serializeSubmittedCards(room.submittedCards),
    players: players,
    stage: room.phase,
    votes: room.votes,
  };
}
