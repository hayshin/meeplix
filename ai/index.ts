import { createDixitPrompts } from "./gemini";
import * as RunWare from "./runware";
import { Card } from "../server/src/ws/models/card.model";
import { randomUUIDv7 } from "bun";

const topic = "disney";
export async function createDeck(
  topic: string,
  count: number,
): Promise<{ cards: Card[]; prompts: string[] }> {
  // const dixitPrompts = await createDixitPrompts(topic, count);
  // const prompts = dixitPrompts.map((dixitPrompt) => dixitPrompt.prompt);
  const prompts: string[] = [];
  const cards: Card[] = [];
  for (let i = 0; i < count; i++) {
    prompts.push("test");
    const id = randomUUIDv7();
    cards.push({
      id,
      imageUrl: `https://meeplix.live/${id}`,
    });
  }
  return { cards, prompts };

  // return RunWare.createDeck(prompts);
}
