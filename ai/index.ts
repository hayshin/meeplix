import { createDixitPrompts } from "./gemini";
import * as RunWare from "./runware";

const topic = "disney";
const dixitPrompts = await createDixitPrompts(topic, 5);
const prompts = dixitPrompts.map((dixitPrompt) => dixitPrompt.prompt);
const deck = RunWare.createDeck(prompts);
