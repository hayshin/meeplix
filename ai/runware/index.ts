import { Runware } from "@runware/sdk-js";
import { createImageWithClient, createImagesWithClient } from "./create-image";
import { ITextToImage } from "@runware/sdk-js";
import { uploadImage } from "./upload-image";
import { Card } from "../../server/src/ws/models/card.model";
import { ModelType } from "./models";

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

export async function createDeck(
  deckId: string,
  prompts: string[],
  modelType: ModelType,
): Promise<{ cards: Card[]; prompts: string[] }> {
  const cards: Card[] = [];
  const final_prompts: string[] = [];
  for (let prompt of prompts) {
    prompt =
      "A surreal, dreamlike illustration in the style of Dixit cards. " +
      prompt +
      " Art style similar to Marie Cardouat.";
    const image = await createImageWithClient(runware, prompt, modelType);
    const url = image.imageURL;
    if (!url) {
      throw new Error(`Failed to generate image for prompt: ${prompt}`);
    }
    uploadImage(deckId, image);
    const card = {
      id: image.imageUUID,
      // name: prompt,
      imageUrl: url,
    };
    final_prompts.push(prompt);
    cards.push(card);
  }
  return { cards, prompts: final_prompts };
}

export async function createImage(prompt: string,  modelType: ModelType,
 ): Promise<ITextToImage> {
  return createImageWithClient(runware, prompt, modelType);
}

// export async function createImages(prompts: string[]): Promise<ITextToImage[]> {
//   const images = await createImagesWithClient(runware, prompts);
//   return images;
// }
