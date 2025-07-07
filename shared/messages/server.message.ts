import type { Static } from "elysia";
import { t } from "elysia";
import { messageSchema } from "./message";
import { PlayerDTO } from "../models/player";
import { PublicCardDTO } from "../models/public_card";
import { VoteDTO } from "../models/vote";
import { PublicRoomStateDTO } from "$shared/models/public_room";

export const RoomJoinedMessage = messageSchema("PLAYER_JOINED", {
  player: PlayerDTO,
});

export const RoomStateMessage = messageSchema("ROOM_STATE", {
  player: PlayerDTO,
  room: PublicRoomStateDTO,
});
export const RoomCreatedMessage = messageSchema("ROOM_CREATED", {
  // player: PlayerDTO,
  roomId: t.String(),
});

export const StartRoundMessage = messageSchema("START_ROUND", {
  // hand: Card[],
  // roundNumber: t.Number(),
  currentHand: t.Array(PublicCardDTO),
  leaderId: t.String(),
});

export const PlayerVotedMessage = messageSchema("PLAYER_VOTED", {
  playerId: t.String(),
});

export const PlayerReadyMessage = messageSchema("PLAYER_READY", {
  playerId: t.String(),
});
export const PlayerSubmitMessage = messageSchema("PLAYER_SUBMIT_CARD", {
  playerId: t.String(),
});

export const PlayerConnectedMessage = messageSchema("PLAYER_CONNECTED", {
  player: PlayerDTO,
});

export const PlayerDisconnectedMessage = messageSchema("PLAYER_DISCONNECTED", {
  playerId: t.String(),
});

export const PhaseChooseCardMessage = messageSchema("PHASE_CHOOSE_CARD", {
  player: PlayerDTO,
  description: t.String(),
  // hand: t.Array(t.String()),
});

export const PhaseBeginVoteMessage = messageSchema("PHASE_BEGIN_VOTE", {
  cardsForVoting: t.Array(PublicCardDTO),
});

export const PhaseEndVoteMessage = messageSchema("PHASE_END_VOTE", {
  votes: t.Array(VoteDTO),
  leaderCardId: t.String(),
  players: t.Array(PlayerDTO),
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

export const ReconnectSuccessMessage = messageSchema("RECONNECT_SUCCESS", {
  player: PlayerDTO,
  room: PublicRoomStateDTO,
});

export const ReconnectFailedMessage = messageSchema("RECONNECT_FAILED", {
  message: t.String(),
});

export const ServerMessage = t.Union([
  RoomJoinedMessage,
  RoomStateMessage,
  RoomCreatedMessage,
  StartRoundMessage,
  PlayerReadyMessage,
  PlayerSubmitMessage,
  PlayerVotedMessage,
  PlayerConnectedMessage,
  PlayerDisconnectedMessage,
  PhaseChooseCardMessage,
  PhaseBeginVoteMessage,
  PhaseEndVoteMessage,
  EndGameMessage,
  ErrorMessage,
  ReconnectSuccessMessage,
  ReconnectFailedMessage,
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
export type ReconnectSuccessMessage = Static<typeof ReconnectSuccessMessage>;
export type ReconnectFailedMessage = Static<typeof ReconnectFailedMessage>;
export type ServerMessage = Static<typeof ServerMessage>;
