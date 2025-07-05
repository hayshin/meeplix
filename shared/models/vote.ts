import { t } from "elysia";
import { PublicCardDTO } from "./public_card";

export const VoteDTO = t.Object({
  card: PublicCardDTO,
  player: t.String(),
});

export const VotesDTO = t.Array(VoteDTO);
