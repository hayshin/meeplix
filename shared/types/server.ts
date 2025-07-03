import type { Static } from "elysia";
import { t } from "elysia";
import { CardSchema, CardCollectionSchema } from "./card";
import { PlayerCollection } from "./player";
import { PlayerSchema } from "./player";
import { CollectionSchema } from "./collection";
import { BaseEntity } from "./entity";
import { RoomStateSchema } from "./room";
import { VoteCollectionSchema } from "./vote";

export const BaseServerMessageSchema = t.Object({
  // roomId: t.String(),
  roomState: RoomStateSchema,
});

export const StartRoundMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("start_round"),
  roundNumber: t.Number(),
  currentHand: CardCollectionSchema,
});

export const PlayerReadyMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("player_ready"),
  roomId: t.String(),
  playerId: t.String(),
});

export const RoomJoinedMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("player_joined"),
  roomId: t.String(),
  playerId: t.String(),
});

export const RoomCreatedMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("room_created"),
  roomId: t.String(),
});

export const PlayersChooseCardMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("players_choose_card"),
  currentHand: CardCollectionSchema,
});

export const BeginVoteMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("begin_vote"),
  cardsForVoting: t.Array(CardSchema),
});

export const EndVoteMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("end_vote"),
  votedCards: VoteCollectionSchema,
  leaderCard: CardSchema,
});

export const ErrorMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("error"),
  message: t.String(),
});

export const EndGameMessageSchema = t.Object({
  ...BaseServerMessageSchema.properties,
  type: t.Literal("end_game"),
  winner: t.String(),
});

export const ServerMessageSchema = t.Union([
  StartRoundMessageSchema,
  PlayersChooseCardMessageSchema,
  PlayerReadyMessageSchema,
  BeginVoteMessageSchema,
  EndVoteMessageSchema,
  ErrorMessageSchema,
  EndGameMessageSchema,
  RoomCreatedMessageSchema,
  RoomJoinedMessageSchema,
]);

export type BaseServerMessage = Static<typeof BaseServerMessageSchema>;
// Type exports
export type StartRoundMessage = Static<typeof StartRoundMessageSchema>;
export type PlayersChooseCardMessage = Static<
  typeof PlayersChooseCardMessageSchema
>;
export type BeginVoteMessage = Static<typeof BeginVoteMessageSchema>;
export type EndVoteMessage = Static<typeof EndVoteMessageSchema>;
export type ErrorMessage = Static<typeof ErrorMessageSchema>;
export type EndGameMessage = Static<typeof EndGameMessageSchema>;
export type RoomCreatedMessage = Static<typeof RoomCreatedMessageSchema>;
export type RoomJoinedMessage = Static<typeof RoomJoinedMessageSchema>;
export type ServerMessage = Static<typeof ServerMessageSchema>;

// // Server message without room state updates (schema)
// export const ServerMessageWithoutRoomStateSchema = t.Union([
//   StartRoundMessageSchema,
//   PlayersChooseCardMessageSchema,
//   PointChangeSchema,
//   BeginVoteMessageSchema,
//   EndVoteMessageSchema,
//   ErrorMessageSchema,
//   EndGameMessageSchema,
//   RoomCreatedMessageSchema,
//   RoomJoinedMessageSchema,
// ]);

export type ServerMessageWithoutRoomState = ServerMessage extends infer M
  ? M extends { roomState: any }
    ? Omit<M, "roomState">
    : M
  : never;
