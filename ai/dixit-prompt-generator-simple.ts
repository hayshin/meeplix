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
const DixitPromptsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.NUMBER,
            description: "Sequential ID number from 1 to 84",
          },
          prompt: {
            type: Type.STRING,
            description: "The creative Dixit prompt for image generation",
          },
          description: {
            type: Type.STRING,
            description: "Optional description of the prompt's artistic intent",
          },
        },
        required: ["id", "prompt"],
      },
      minItems: "84",
      maxItems: "84",
      description: "Array of exactly 84 Dixit prompts",
    },
  },
  required: ["prompts"],
  description: "Response containing exactly 84 creative Dixit prompts",
};

interface DixitPrompt {
  id: number;
  prompt: string;
  description?: string;
}

async function generateDixitPrompts(topic: string): Promise<DixitPrompt[]> {
  console.log(`🤖 Generating 84 Dixit prompts for topic: "${topic}"`);

  const prompt = `Generate exactly 84 creative AI prompts for Dixit boardgame image generation with the topic: ${topic}

Instructions:
- Each prompt should be surreal, dreamlike, and evocative like Dixit cards
- Incorporate "${topic}" creatively and artistically
- Make each prompt unique and suitable for AI image generation
- Keep prompts concise but visually descriptive
- Focus on symbolic, fantastical, and poetic elements
- Number each prompt sequentially from 1 to 84

Create prompts that capture the essence of Dixit's whimsical, abstract storytelling through visual metaphors and imaginative scenarios.`;

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

    if (!parsed.prompts || !Array.isArray(parsed.prompts)) {
      throw new Error("Invalid response format - missing prompts array");
    }

    if (parsed.prompts.length !== 84) {
      console.warn(`⚠️  Expected 84 prompts, got ${parsed.prompts.length}`);
    }

    console.log(`✅ Successfully generated ${parsed.prompts.length} prompts`);
    return parsed.prompts;
  } catch (error) {
    console.error("❌ Error generating or parsing prompts:", error);
    throw error;
  }
}

async function main() {
  // Get topic from command line argument
  const topic = process.argv[2];

  if (!topic) {
    console.error("❌ Please provide a topic as a command line argument");
    console.log(
      'Usage: bun run ai/dixit-prompt-generator-simple.ts "your topic here"',
    );
    process.exit(1);
  }

  try {
    // Generate prompts using Gemini AI
    const prompts = await generateDixitPrompts(topic);

    // Print all prompts to console
    console.log("\n🎨 Generated Dixit Prompts:");
    console.log("=" + "=".repeat(60));

    prompts.forEach((prompt) => {
      console.log(`\n${prompt.id}. ${prompt.prompt}`);
      if (prompt.description) {
        console.log(`   💭 ${prompt.description}`);
      }
    });

    console.log("\n" + "=".repeat(62));
    console.log(`✨ Total prompts generated: ${prompts.length}`);
    console.log(`📋 Topic: "${topic}"`);

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

export { generateDixitPrompts };
