import type { Static } from "elysia";
import { v4 as uuidv4 } from "uuid";

import { t } from "elysia";

export const PlayerStatusDTO = t.Union([
  t.Literal("online"),
  t.Literal("offline"),
  t.Literal("ready"),
]);
export type PlayerStatus = Static<typeof PlayerStatusDTO>;

export const PlayerDTO = t.Object({
  id: t.String({ uuid: true }),
  username: t.String({ minLength: 2, maxLength: 32 }),
  score: t.Number({ minimum: 0 }),
  socketId: t.String(),
  roomId: t.String(),
  status: PlayerStatusDTO,
  joinedAt: t.Date(),
});

export type Player = Static<typeof PlayerDTO>;

export const createPlayer = (nickname: string, roomId: string): Player => ({
  id: uuidv4(),
  username: nickname,
  score: 0,
  socketId: "",
  roomId: roomId,
  status: "online",
  joinedAt: new Date(),
});
