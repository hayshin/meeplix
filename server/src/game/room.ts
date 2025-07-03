import { v4 as uuidv4 } from "uuid";
import { PlayerEntity, PlayerCollection } from "$types/player";
import { SubmittedCardCollection } from "$shared/types/submitted_card";
import { CardCollection } from "$types/card";
import { RoomStateEntity } from "$types/room";
import { loadCardsFromAssets } from "./cards";
import { VoteCollection } from "$shared/types/vote";

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
    new SubmittedCardCollection([]),
    "joining",
    new VoteCollection([]),
  );

  return room;
}
