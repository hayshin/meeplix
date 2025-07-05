import { Static, t } from "elysia";
import { PlayerDTO } from "./player";
import { PublicCardDTO } from "./public_card";
import { VoteDTO } from "./vote";

export const RoomPhaseDTO = t.Union([
  t.Literal("joining"),
  t.Literal("leader_submitting"),
  t.Literal("players_submitting"),
  t.Literal("voting"),
  t.Literal("results"),
  t.Literal("finished"),
]);

export const PublicRoomStateDTO = t.Object({
  id: t.String(),
  players: t.Array(PlayerDTO),
  roundNumber: t.Number(),
  leaderId: t.String(),
  currentDescription: t.String(),
  // for the active player, this is the active card; for other players, this is the card they chose
  submittedCards: t.Array(PublicCardDTO),
  stage: RoomPhaseDTO,
  votes: t.Array(VoteDTO),
});

export type PublicRoomState = Static<typeof PublicRoomStateDTO>;
