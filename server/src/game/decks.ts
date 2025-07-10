import { v4 as uuidv4 } from "uuid";
import { db, decks, cards, deckCards } from "../db";
import { eq } from "drizzle-orm";
import * as ai from "../../../ai";
import { Card } from "$/ws/models/card.model";
import { getImageUrl } from "~/ai/azure";

const model = "runware:100@1";

export async function getCardsFromDeck(deckId: string): Promise<Card[]> {
  const cardsFromTable = await db
    .select({
      card: cards, // or list specific columns
    })
    .from(deckCards)
    .innerJoin(cards, eq(deckCards.cardId, cards.id))
    .where(eq(deckCards.deckId, deckId));
  if (!cardsFromTable.length) {
    throw new Error(`Deck with id ${deckId} not found`);
  }
  const result: Card[] = [];
  const firstCard = cardsFromTable[0].card;
  await getImageUrl(deckId, firstCard.id, true);
  for (const card of cardsFromTable) {
    const imageUrl = await getImageUrl(deckId, card.card.id);
    result.push({ id: card.card.id, imageUrl });
  }

  // result is an array of { card: Card }
  return result;
}
export async function createDeck(
  topic: string,
  amount: number = 84,
): Promise<string> {
  const deckId = uuidv4();
  await db.insert(decks).values({
    id: deckId,
    name: topic,
    amount: amount,
    description: topic,
    ai_model: model,
    ai_provider: "runware",
  });
  const { cards: final_cards, prompts } = await ai.createDeck(
    deckId,
    topic,
    amount,
  );
  for (let i = 0; i < prompts.length; i++) {
    await db.insert(cards).values({
      id: final_cards[i].id,
      ai_prompt: prompts[i],
      // name: card.name,
      // description: card.description,
      // type: card.type,
      // rarity: card.rarity,
      // image: card.image,
      // deck_id: deckId,
    });
    await db.insert(deckCards).values({
      deckId: deckId,
      cardId: final_cards[i].id,
    });
  }
  return deckId;
}
