import { v4 as uuidv4 } from "uuid";
import { PlayerEntity } from "$types/player";
import { CardCollection } from "$types/card";

export function createPlayer(nickname: string): PlayerEntity {
  const id = uuidv4();
  const now = new Date();
  return new PlayerEntity(
    id,
    nickname,
    0,
    new CardCollection(),
    true,
    now,
    false,
  );
}
