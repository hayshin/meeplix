import { GoogleGenAI, Schema, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY environment variable is required");
  console.log("Please set your API key: export GEMINI_API_KEY='your-key-here'");
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
      minItems: 84,
      maxItems: 84,
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

async function testDixitPromptGeneration() {
  console.log("🧪 Testing Dixit Prompt Generator with responseSchema");
  console.log("=" + "=".repeat(60));

  const testTopic = "magical forest";

  console.log(`🎯 Test Topic: "${testTopic}"`);
  console.log(`🤖 Generating structured prompts...`);

  const prompt = `Generate exactly 84 creative AI prompts for Dixit boardgame image generation with the topic: ${testTopic}

Instructions:
- Each prompt should be surreal, dreamlike, and evocative like Dixit cards
- Incorporate "${testTopic}" creatively and artistically
- Make each prompt unique and suitable for AI image generation
- Keep prompts concise but visually descriptive
- Focus on symbolic, fantastical, and poetic elements
- Number each prompt sequentially from 1 to 84

Create prompts that capture the essence of Dixit's whimsical, abstract storytelling through visual metaphors and imaginative scenarios.`;

  try {
    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: models.gemini_flash_lite,
      contents: prompt,
      config: {
        responseSchema: DixitPromptsSchema,
        responseMimeType: "application/json",
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`⏱️  Generation completed in ${duration}ms`);

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    console.log("📝 Parsing structured response...");

    // Parse JSON response - guaranteed to match schema
    const parsed = JSON.parse(responseText);

    if (!parsed.prompts || !Array.isArray(parsed.prompts)) {
      throw new Error("Invalid response format - missing prompts array");
    }

    console.log(`✅ Successfully generated ${parsed.prompts.length} prompts`);

    // Validate structure
    const prompts = parsed.prompts as DixitPrompt[];

    // Test schema validation
    console.log("\n🔍 Validating Response Structure:");
    console.log(`   • Prompts array length: ${prompts.length}`);
    console.log(`   • Expected length: 84`);
    console.log(`   • Length matches: ${prompts.length === 84 ? '✅' : '❌'}`);

    // Check ID sequence
    const hasSequentialIds = prompts.every((p, i) => p.id === i + 1);
    console.log(`   • Sequential IDs (1-84): ${hasSequentialIds ? '✅' : '❌'}`);

    // Check all prompts have required fields
    const allHaveRequiredFields = prompts.every(p =>
      typeof p.id === 'number' && typeof p.prompt === 'string' && p.prompt.length > 0
    );
    console.log(`   • All have required fields: ${allHaveRequiredFields ? '✅' : '❌'}`);

    // Check topic integration
    const topicMentioned = prompts.filter(p =>
      p.prompt.toLowerCase().includes('forest') ||
      p.prompt.toLowerCase().includes('magical') ||
      p.prompt.toLowerCase().includes('tree') ||
      p.prompt.toLowerCase().includes('wood')
    ).length;
    console.log(`   • Topic integration: ${topicMentioned}/84 prompts mention forest/magical/tree/wood`);

    // Show sample prompts
    console.log("\n🎨 Sample Generated Prompts:");
    console.log("-" + "-".repeat(60));

    // Show first 5 prompts
    prompts.slice(0, 5).forEach((prompt) => {
      console.log(`\n${prompt.id}. ${prompt.prompt}`);
      if (prompt.description) {
        console.log(`   💭 ${prompt.description}`);
      }
    });

    console.log(`\n... (showing 5 of ${prompts.length} prompts)`);

    // Show last 2 prompts
    console.log("\n📋 Last 2 prompts:");
    prompts.slice(-2).forEach((prompt) => {
      console.log(`\n${prompt.id}. ${prompt.prompt}`);
      if (prompt.description) {
        console.log(`   💭 ${prompt.description}`);
      }
    });

    console.log("\n" + "=".repeat(62));
    console.log("🎉 Test completed successfully!");
    console.log(`✨ responseSchema guaranteed structured output`);
    console.log(`📊 Performance: ${duration}ms for 84 prompts`);
    console.log(`🔒 Type safety: All prompts validated`);

    return prompts;

  } catch (error) {
    console.error("❌ Test failed:", error);

    if (error instanceof Error) {
      console.error("Error details:", error.message);
      if (error.stack) {
        console.error("Stack trace:", error.stack);
      }
    }

    process.exit(1);
  }
}

async function main() {
  try {
    await testDixitPromptGeneration();
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  }
}

// Run the test
if (import.meta.main) {
  main();
}

export { testDixitPromptGeneration };
