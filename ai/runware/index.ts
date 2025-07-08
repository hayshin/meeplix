const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
import { Runware } from "@runware/sdk-js";
import { createImages } from "./create-image";
import { uploadImages } from "./upload-image";
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

export async function createDeck(prompt: string, numberCards: number) {
  const images = await createImages(runware, prompt, numberCards);
  for (const image of images) {
    console.log(image);
  }
  const urls = await uploadImages(images);
  for (const url of urls) {
    console.log(url);
  }
}

createDeck(
  "A series of cards inspired by Dixit boardgame, with a variety of themes and illustrations. Dreamy and surreal",
  5,
);
