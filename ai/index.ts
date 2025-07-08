import { createDixitPrompts } from "./gemini";
import * as RunWare from "./runware";
import { Card } from "../server/src/ws/models/card.model";

const topic = "disney";
export async function createDeck(
  topic: string,
  count: number,
): Promise<{ cards: Card[]; prompts: string[] }> {
  const dixitPrompts = await createDixitPrompts(topic, count);
  const prompts = dixitPrompts.map((dixitPrompt) => dixitPrompt.prompt);
  return RunWare.createDeck(prompts);
}
