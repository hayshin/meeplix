const card_prompt = "almaty mountains";

import { ITextToImage, RunwareClient } from "@runware/sdk-js";
import { IModel, defaultOptions, ModelType, models } from "./models";

export async function createImagesWithClient(
  runware: RunwareClient,
  prompt: string,
  modelType: ModelType,
  numberResults?: number,
): Promise<ITextToImage[]> {
  try {
    const model = models[modelType];
    const images = await runware.requestImages({
      ...model.options,
      ...defaultOptions,
      positivePrompt: prompt,
      numberResults: numberResults,
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

export async function createImageWithClient(
  runware: RunwareClient,
  prompt: string,
  modelType: ModelType,
): Promise<ITextToImage> {
  const images = await createImagesWithClient(runware, prompt, modelType);
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
