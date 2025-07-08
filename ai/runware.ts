const card_prompt = "almaty marathon";
const model = "runware:100@1";
const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
import { Runware } from "@runware/sdk-js";

const runware = new Runware({ apiKey: RUNWARE_API_KEY });

export async function generateCardImage(
  prompt: string,
  uploadEndpoint?: string,
): Promise<string | undefined> {
  try {
    const images = await runware.requestImages({
      positivePrompt: prompt,
      model: model,
      width: 896,
      height: 1152,
      steps: 4,
      numberResults: 1,
      outputFormat: "WEBP",
      CFGScale: 1,
      seed: 1,
      scheduler: "FlowMatchEulerDiscreteScheduler",
      outputType: "URL",
      uploadEndpoint,
    });

    if (!images || images.length === 0) {
      throw new Error("No images generated");
    }

    console.log("Generated image:", images[0]);
    return images[0].imageURL;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

import { uploadImageToAzure } from "./azure";

async function testUpload() {
  try {
    const imageUrl = await generateCardImage(card_prompt);
    if (!imageUrl) {
      throw new Error("No image URL generated");
    }
    const name = "tuntuntun";
    const url = await uploadImageToAzure(imageUrl, name);
    console.log("Final image URL:", url);
  } catch (error) {
    console.error("Upload test failed:", error);
  }
}

testUpload();
