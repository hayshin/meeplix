import { DixitPrompt, DixitPromptsSchema } from "./types";
import { GoogleGenAI } from "@google/genai";

export async function createDixitPrompts(
  ai: GoogleGenAI,
  model: string,
  topic: string,
  amount: number,
): Promise<DixitPrompt[]> {
  console.log(`🤖 Generating ${amount} Dixit prompts for topic: "${topic}"`);

  const prompt = `Create ${amount} prompts for generating ${amount} images of cards inspired by Dixit boardgame and ${topic}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseSchema: {
          ...DixitPromptsSchema,
          minItems: amount.toString(),
          maxItems: amount.toString(),
        },
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }
    console.log("📝 Structured AI response received, parsing...");

    // Parse JSON response - should be guaranteed to match schema
    const parsed = JSON.parse(responseText);
    console.log(parsed);

    if (parsed.length !== amount) {
      console.warn(`⚠️  Expected ${amount} prompts, got ${parsed.length}`);
    }

    console.log(`✅ Successfully generated ${parsed.length} prompts`);
    return parsed;
  } catch (error) {
    console.error("❌ Error generating prompts:", error);
    throw error;
  }
}
