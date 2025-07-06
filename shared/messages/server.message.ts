import type { Static } from "elysia";
import { t } from "elysia";
import { messageSchema } from "./message";
import { PlayerDTO } from "../models/player";
import { CardDTO } from "$/ws/models/card.model";
import { PublicCardDTO } from "$shared/models/public_card";
import { VoteDTO } from "$shared/models/vote";

export const RoomJoinedMessage = messageSchema("PLAYER_JOINED", {
  player: PlayerDTO,
});

export const RoomCreatedMessage = messageSchema("ROOM_CREATED", {
  // player: PlayerDTO,
  roomId: t.String(),
});

export const StartRoundMessage = messageSchema("START_ROUND", {
  // hand: Card[],
  // roundNumber: t.Number(),
  currentHand: t.Array(PublicCardDTO),
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
  // hand: t.Array(t.String()),
});

export const PhaseBeginVoteMessage = messageSchema("PHASE_BEGIN_VOTE", {
  cardsForVoting: t.Array(PublicCardDTO),
});

export const PhaseEndVoteMessage = messageSchema("PHASE_END_VOTE", {
  votes: t.Array(VoteDTO),
  leaderCardId: t.String(),
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
