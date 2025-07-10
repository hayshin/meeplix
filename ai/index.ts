import { createDixitPrompts } from "./gemini";
import * as RunWare from "./runware";
import { Card } from "../server/src/ws/models/card.model";
import { v4 as uuidv4 } from "uuid";

const topic = "disney";
export async function createDeck(
  deckId: string,
  topic: string,
  count: number,
): Promise<{ cards: Card[]; prompts: string[] }> {
  const dixitPrompts = await createDixitPrompts(topic, count);
  const prompts = dixitPrompts.map((dixitPrompt) => dixitPrompt.prompt);
  // const prompts: string[] = [];
  // const cards: Card[] = [];
  // for (let i = 0; i < count; i++) {
  //   prompts.push("test");
  //   const id = randomUUIDv7();
  //   cards.push({
  //     id,
  //     imageUrl: `https://meeplix.live/${id}`,
  //   });
  // }
  // return { cards, prompts };

  return RunWare.createDeck(deckId, prompts);
}
