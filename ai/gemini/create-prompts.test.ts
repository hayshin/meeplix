import { createDixitPrompts } from ".";
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

async function main() {
  try {
    const topic = await getTopicFromConsole();

    if (!topic) {
      console.error("❌ No topic provided");
      process.exit(1);
    }

    // Step 2: Generate prompts using Gemini AI
    const prompts = await createDixitPrompts(topic, 5);

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
