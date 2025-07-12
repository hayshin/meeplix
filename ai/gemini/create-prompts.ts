import { DixitPrompt, DixitPromptsSchema } from "./types";
import { GoogleGenAI } from "@google/genai";

export async function createDixitPrompts(
  ai: GoogleGenAI,
  model: string,
  topic: string,
  amount: number,
): Promise<DixitPrompt[]> {
  console.log(`🤖 Generating ${amount} Dixit prompts for topic: "${topic}"`);

  const dixitStyle = `in the surreal, whimsical, and imaginative style of a Dixit card. Use a soft painterly illustration approach with gentle brush strokes, pastel and earthy tones, warm golden lighting, subtle gradients, dreamlike atmospheres, and fantastical compositions. Avoid photorealism. Each image should feel like a scene from a fable, dream, or metaphorical story, evoking curiosity, ambiguity, and emotional resonance.`;

  const prompt = `You are a Senior Prompt Engineer. Your task is to generate ${amount} unique, high-quality prompts for generating AI images using the SDXL model. These images will be used as cards in an online version of the Dixit board game.

  Each card must:
  - Resemble the visual style of a Dixit card (${dixitStyle})
  - Be based on the theme: "${topic}"
  - Reference famous or widely recognized characters, motifs, or elements from the topic to make the theme identifiable, but don't put too much emphasis on them. Describe them properly and in detail.
  - Include brief contextual descriptions for less well-known elements
  - Contain unique compositions and scenes—each card must evoke a different mood or idea
  - Stimulate imagination and various interpretations, just like real Dixit cards

  Focus on metaphorical scenes, surreal imagery, emotional depth, and artistic ambiguity. Do **not** use photorealistic rendering—ensure all prompts guide toward artistic and expressive styles.

  You are paid $1000 per prompt, so make them evocative, detailed, and beautifully composed. Be verbose, show imagination. Output ${amount} prompts.`;

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
