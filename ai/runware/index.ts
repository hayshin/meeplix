const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
import { Runware } from "@runware/sdk-js";
import { createImage } from "./create-image";
import { uploadImage } from "./upload-image";
const runware = new Runware({ apiKey: RUNWARE_API_KEY });
import { Card } from "../../server/src/ws/models/card.model";
import { uploadImageToAzure } from "../azure";

export async function createDeck(
  prompts: string[],
): Promise<{ cards: Card[]; prompts: string[] }> {
  const cards: Card[] = [];
  const final_prompts: string[] = [];
  for (let prompt of prompts) {
    prompt =
      "A surreal, dreamlike illustration in the style of Dixit cards. " +
      prompt +
      " Art style similar to Marie Cardouat.";
    // const image = await createImage(runware, prompt);
    const url = "test.url";
    const id = "prompt";
    // const url = image.imageURL;
    // if (!url) {
    //   throw new Error(`Failed to generate image for prompt: ${prompt}`);
    // }
    // uploadImageToAzure(url, image.imageUUID);
    uploadImageToAzure(url, id);
    const card = {
      // id: image.imageUUID,
      id,
      // name: prompt,
      imageUrl: url,
    };
    final_prompts.push(prompt);
    cards.push(card);
  }
  return { cards, prompts: final_prompts };
}
