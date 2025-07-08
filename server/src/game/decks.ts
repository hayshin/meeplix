import { v4 as uuidv4 } from "uuid";
import { db, decks, cards, deckCards } from "../db";
import * as ai from "../../../ai";
import { Card } from "$/ws/models/card.model";

const model = "runware:100@1";
export async function createDeck(
  topic: string,
  amount: number = 84,
): Promise<Card[]> {
  const deckId = uuidv4();
  await db.insert(decks).values({
    id: deckId,
    name: topic,
    amount: amount,
    description: topic,
    ai_model: model,
    ai_provider: "runware",
  });
  const { cards: final_cards, prompts } = await ai.createDeck(topic, amount);
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
  return final_cards;
}
