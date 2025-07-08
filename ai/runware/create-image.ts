const card_prompt = "almaty mountains";
const model = "runware:100@1";
import { ITextToImage, RunwareClient } from "@runware/sdk-js";

export async function createImages(
  runware: RunwareClient,
  prompt: string,
  numberResults?: number,
  uploadEndpoint?: string,
): Promise<ITextToImage[]> {
  try {
    const images = await runware.requestImages({
      positivePrompt: prompt,
      model: model,
      width: 896,
      height: 1152,
      steps: 4,
      numberResults: numberResults,
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

    console.log("Generated images: ", images);
    return images;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

export async function createImage(
  runware: RunwareClient,
  prompt: string,
): Promise<ITextToImage> {
  const images = await createImages(runware, prompt, 1);
  return images[0];
}

// async function testUpload() {
//   try {
//     const imageUrl = await generateCardImages(card_prompt);
//     if (!imageUrl) {
//       throw new Error("No image URL generated");
//     }
//     const name = "tuntuntun";
//     const url = await uploadImageToAzure(imageUrl, name);
//     console.log("Final image URL:", url);
//   } catch (error) {
//     console.error("Upload test failed:", error);
//   }
// }

// testUpload();
