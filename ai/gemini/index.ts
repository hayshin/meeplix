import { GoogleGenAI, Schema, Type } from "@google/genai";
import * as Prompter from "./create-prompts";
import { DixitPrompt } from "./types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const models = {
  gemini_flash_lite: "models/gemini-2.5-flash-lite-preview-06-17",
};

export async function createDixitPrompts(
  topic: string,
): Promise<DixitPrompt[]> {
  return Prompter.createDixitPrompts(ai, models.gemini_flash_lite, topic);
}
