import type { Static } from "elysia";
import { t } from "elysia";

export const PlayerStatusDTO = t.Union([
  t.Literal("online"),
  t.Literal("offline"),
  t.Literal("ready"),
]);
export type PlayerStatus = Static<typeof PlayerStatusDTO>;

export const PlayerDTO = t.Object({
  id: t.String({ uuid: true }),
  nickname: t.String({ minLength: 2, maxLength: 32 }),
  score: t.Number(),
  socketId: t.String(),
  status: PlayerStatusDTO,
  joinedAt: t.Date(),
});

export type Player = Static<typeof PlayerDTO>;
