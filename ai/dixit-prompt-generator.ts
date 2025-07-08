import { GoogleGenAI, Schema, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const models = {
  gemini_flash_lite: "models/gemini-2.5-flash-lite-preview-06-17",
};

// Define the structured response schema for Gemini
const DixitPromptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prompt: {
      type: Type.STRING,
    },
  },
  required: ["prompt"],
};

const DixitPromptsSchema: Schema = {
  type: Type.ARRAY,
  items: DixitPromptSchema,
  minItems: "84",
  maxItems: "84",
  description: "Response containing exactly 84 creative Dixit prompts",
};

interface DixitPrompt {
  id: number;
  prompt: string;
}

interface DixitPromptsResponse {
  prompts: DixitPrompt[];
}

async function getTopicFromConsole(): Promise<string> {
  console.log("🎯 Please enter a topic for generating Dixit prompts:");

  // Read from stdin
  const decoder = new TextDecoder();
  const buffer = new Uint8Array(1024);

  return new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (data) => {
      const topic = data.toString().trim();
      process.stdin.pause();
      resolve(topic);
    });
  });
}

async function generateDixitPrompts(topic: string): Promise<DixitPrompt[]> {
  console.log(`🤖 Generating 84 Dixit prompts for topic: "${topic}"`);

  const prompt = `You are a creative assistant for a board game similar to Dixit. Your task is to generate 84 unique, imaginative, and surreal image descriptions that will be used to generate artwork for playing cards.

  Each card should depict a dreamlike, poetic, or metaphorical scene that sparks interpretation and storytelling. The illustrations will be in a whimsical, surreal, and painterly art style (similar to Dixit cards).

  The deck must be centered around a specific theme provided by the user. You should use the theme to inspire your prompts. Use the theme to create a cohesive and engaging narrative for the deck. Use the theme to guide the imagery and symbolism in each prompt.

  Instructions:
    - You must generate 84 unique image prompts.
    - Avoid concrete references to existing intellectual property unless allowed by the theme.
    - Blend surreal, symbolic, and fantastical elements.
    - The prompts should be diverse — vary the scenes, subjects, symbolism, and emotional tone.
    - Do not number the items.

  Theme: {${topic}}

  Begin generating the prompts now.`;

  try {
    const response = await ai.models.generateContent({
      model: models.gemini_flash_lite,
      contents: prompt,
      config: {
        responseSchema: DixitPromptsSchema,
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

    if (parsed.length !== 84) {
      console.warn(`⚠️  Expected 84 prompts, got ${parsed.length}`);
    }

    console.log(`✅ Successfully generated ${parsed.length} prompts`);
    return parsed;
  } catch (error) {
    console.error("❌ Error generating prompts:", error);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Get topic from console
    const topic = await getTopicFromConsole();

    if (!topic) {
      console.error("❌ No topic provided");
      process.exit(1);
    }

    // Step 2: Generate prompts using Gemini AI
    const prompts = await generateDixitPrompts(topic);

    // Step 3: Print all prompts to console
    console.log("\n🎨 Generated Dixit Prompts:");
    console.log("=" + "=".repeat(50));

    prompts.forEach((prompt, index) => {
      console.log(`\n${index + 1}. ${prompt.prompt}`);
    });

    console.log("\n" + "=".repeat(52));
    console.log(`✨ Total prompts generated: ${prompts.length}`);

    // Optional: Return as array for further processing
    return prompts;
  } catch (error) {
    console.error("❌ Workflow failed:", error);
    process.exit(1);
  }
}

// Run the workflow
if (import.meta.main) {
  main();
}

export { generateDixitPrompts, getTopicFromConsole };
