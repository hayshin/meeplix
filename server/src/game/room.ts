import { v4 as uuidv4 } from "uuid";
import { PlayerEntity, PlayerCollection } from "$types/player";
import { PairHandCollection } from "$shared/types/pair";
import { CardCollection } from "$types/card";
import { RoomStateEntity } from "$types/room";
import { loadCardsFromAssets } from "./cards";

export async function createRoom(deckId?: string): Promise<RoomStateEntity> {
  const id = uuidv4();
  const now = new Date();

  // Use default deck if none provided
  let finalDeckId = deckId;

  const deck = loadCardsFromAssets();
  const room = new RoomStateEntity(
    id,
    new PlayerCollection([]),
    new CardCollection(deck),
    0,
    "",
    "",
    new PairHandCollection([]),
    "joining",
    new PairHandCollection([]),
  );

  return room;
}
