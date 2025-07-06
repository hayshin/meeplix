import type { Static } from "elysia";
import { t } from "elysia";
import { messageSchema } from "./message";

export const CreateRoomMessage = messageSchema("CREATE_ROOM", {
  username: t.String(),
});

export const JoinRoomMessage = messageSchema("JOIN_ROOM", {
  username: t.String(),
  roomId: t.String(),
});

export const StartGameMessage = messageSchema("START_GAME", {
  playerId: t.String(),
  roomId: t.String(),
});

export const ReadyMessage = messageSchema("READY", {
  playerId: t.String(),
  roomId: t.String(),
});

export const LeaderSubmitCardMessage = messageSchema("LEADER_SUBMIT_CARD", {
  playerId: t.String(),
  cardId: t.String(),
  roomId: t.String(),
  description: t.String(),
});

export const PlayerSubmitCardMessage = messageSchema("SUBMIT_CARD", {
  playerId: t.String(),
  cardId: t.String(),
  roomId: t.String(),
});

export const VoteMessage = messageSchema("VOTE", {
  playerId: t.String(),
  roomId: t.String(),
  cardId: t.String(),
});

export const NextRoundMessage = messageSchema("NEXT_ROUND", {
  playerId: t.String(),
  roomId: t.String(),
});

export const ReconnectMessage = messageSchema("RECONNECT", {
  roomId: t.String(),
  playerId: t.String(),
  username: t.String(),
});

export const ClientMessage = t.Union([
  CreateRoomMessage,
  JoinRoomMessage,
  StartGameMessage,
  ReadyMessage,
  LeaderSubmitCardMessage,
  PlayerSubmitCardMessage,
  VoteMessage,
  NextRoundMessage,
  ReconnectMessage,
]);

// Type exports for TypeScript
export type CreateRoomMessage = Static<typeof CreateRoomMessage>;
export type JoinRoomMessage = Static<typeof JoinRoomMessage>;
export type StartGameMessage = Static<typeof StartGameMessage>;
export type ReadyMessage = Static<typeof ReadyMessage>;
export type LeaderSubmitCardMessage = Static<typeof LeaderSubmitCardMessage>;
export type PlayerSubmitCardMessage = Static<typeof PlayerSubmitCardMessage>;
export type VoteMessage = Static<typeof VoteMessage>;
export type NextRoundMessage = Static<typeof NextRoundMessage>;
export type ReconnectMessage = Static<typeof ReconnectMessage>;
export type ClientMessage = Static<typeof ClientMessage>;
