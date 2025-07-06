import type { Static } from "elysia";
import { t } from "elysia";
import { messageSchema } from "./message";
import { PlayerDTO } from "../models/player";

export const RoomJoinedMessage = messageSchema("ROOM_JOINED", {
  player: PlayerDTO,
  roomId: t.String(),
});

export const RoomCreatedMessage = messageSchema("ROOM_CREATED", {
  // player: PlayerDTO,
  roomId: t.String(),
});

export const StartRoundMessage = messageSchema("START_ROUND", {
  player: PlayerDTO,
  roundNumber: t.Number(),
  currentHand: t.Array(t.String()),
});

export const PlayerVotedMessage = messageSchema("PLAYER_VOTED", {
  player: t.String(),
});

export const PlayerReadyMessage = messageSchema("PLAYER_READY", {
  player: t.String(),
});

export const PlayerConnectedMessage = messageSchema("PLAYER_CONNECTED", {
  player: PlayerDTO,
});

export const PlayerDisconnectedMessage = messageSchema("PLAYER_DISCONNECTED", {
  player: t.String(),
});

export const PhaseChooseCardMessage = messageSchema("PHASE_CHOOSE_CARD", {
  player: PlayerDTO,
  hand: t.Array(t.String()),
});

export const VotesDTO = t.Record(t.String(), t.String()); // Record<string, string>
export type Votes = Static<typeof VotesDTO>;

export const PhaseBeginVoteMessage = messageSchema("PHASE_BEGIN_VOTE", {
  cardsForVoting: t.Array(t.String()),
});

export const PhaseEndVoteMessage = messageSchema("PHASE_END_VOTE", {
  votes: VotesDTO,
  leaderCard: t.String(),
});

// const votes: Votes = { "1": "2", "2": "3" };
// for (const [key, value] of Object.entries(votes)) {
//   console.log(`${key}: ${value}`);
// }

export const EndGameMessage = messageSchema("END_GAME", {
  winner: t.String(),
});

export const ErrorMessage = messageSchema("ERROR", {
  message: t.String(),
});

export const ServerMessage = t.Union([
  RoomJoinedMessage,
  RoomCreatedMessage,
  PlayerReadyMessage,
  PlayerVotedMessage,
  PlayerConnectedMessage,
  PlayerDisconnectedMessage,
  PhaseChooseCardMessage,
  PhaseBeginVoteMessage,
  PhaseEndVoteMessage,
  EndGameMessage,
  ErrorMessage,
]);

// Type exports for TypeScript
export type RoomJoinedMessage = Static<typeof RoomJoinedMessage>;
export type PlayerReadyMessage = Static<typeof PlayerReadyMessage>;
export type PlayerConnectedMessage = Static<typeof PlayerConnectedMessage>;
export type PlayerDisconnectedMessage = Static<
  typeof PlayerDisconnectedMessage
>;
export type PhaseChooseCardMessage = Static<typeof PhaseChooseCardMessage>;
export type PhaseBeginVoteMessage = Static<typeof PhaseBeginVoteMessage>;
export type PhaseEndVoteMessage = Static<typeof PhaseEndVoteMessage>;
export type EndGameMessage = Static<typeof EndGameMessage>;
export type ServerMessage = Static<typeof ServerMessage>;
