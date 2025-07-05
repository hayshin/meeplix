import { Static, t } from "elysia";
import { PlayersDTO } from "./player";
import { PublicCardsDTO } from "./public_card";
import { VotesDTO } from "./vote";

export const RoomPhaseDTO = t.Union([
  t.Literal("joining"),
  t.Literal("leader_choosing"),
  t.Literal("players_choosing"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);

export const PublicRoomStateDTO = t.Object({
  id: t.String(),
  players: PlayersDTO,
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  submittedCards: PublicCardsDTO,
  stage: RoomPhaseDTO,
  votes: VotesDTO,
});

export type PublicRoomState = Static<typeof PublicRoomStateDTO>;
