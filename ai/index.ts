import { createDixitPrompts } from "./gemini";
import * as RunWare from "./runware";
import { Card } from "../server/src/ws/models/card.model";
import { v4 as uuidv4 } from "uuid";

export async function createDeck(
  deckId: string,
  topic: string,
  count: number,
): Promise<{ cards: Card[]; prompts: string[] }> {
  const dixitPrompts = await createDixitPrompts(topic, count);
  const prompts = dixitPrompts.map((dixitPrompt) => dixitPrompt.prompt);
  return RunWare.createDeck(deckId, prompts, "goodSlowModel");
}
