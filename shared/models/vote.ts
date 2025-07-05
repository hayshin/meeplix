import { t, Static } from "elysia";
import { PublicCardDTO } from "./public_card";

export const VoteDTO = t.Object({
  card: PublicCardDTO,
  player: t.String(),
});
export type Vote = Static<typeof VoteDTO>;
