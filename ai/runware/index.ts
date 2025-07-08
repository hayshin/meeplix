const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
import { Runware } from "@runware/sdk-js";
import { createImage } from "./create-image";
import { uploadImage } from "./upload-image";
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

export async function createDeck(prompts: string[]): Promise<string[]> {
  const urls: string[] = [];
  for (let prompt of prompts) {
    prompt =
      "A surreal, dreamlike illustration in the style of Dixit cards. " +
      prompt +
      " Art style similar to Marie Cardouat.";
    const image = await createImage(runware, prompt);
    const url = await uploadImage(image);
    urls.push(url);
  }
  return urls;
}
