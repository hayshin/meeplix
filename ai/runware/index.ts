import { Runware } from "@runware/sdk-js";
import { createImageWithClient, createImagesWithClient } from "./create-image";
import { ITextToImage } from "@runware/sdk-js";
import { uploadImage } from "./upload-image";
import { Card } from "../../server/src/ws/models/card.model";
import { ModelType } from "./models";

const RUNWARE_API_KEY = process.env.RUNWARE_API_KEY || "your_api_key_here";
const runware = new Runware({ apiKey: RUNWARE_API_KEY });

// Helper function to split array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function createDeck(
  deckId: string,
  prompts: string[],
  modelType: ModelType,
): Promise<{ cards: Card[]; prompts: string[] }> {
  const cards: Card[] = [];
  const enhancedPrompts: string[] = [];

  // Process prompts in chunks of 5
  const promptChunks = chunkArray(prompts, 5);

  for (const chunk of promptChunks) {
    // Process each chunk in parallel
    const chunkPromises = chunk.map(async (prompt) => {
      const image = await createImageWithClient(runware, prompt, modelType);
      const url = image.imageURL;
      if (!url) {
        throw new Error(`Failed to generate image for prompt: ${prompt}`);
      }
      uploadImage(deckId, image);
      return {
        card: {
          id: image.imageUUID,
          imageUrl: url,
        } as Card,
        prompt: prompt
      };
    });

    // Wait for all images in this chunk to complete
    const chunkResults = await Promise.all(chunkPromises);

    // Add results to arrays
    chunkResults.forEach(({ card, prompt }) => {
      cards.push(card);
      enhancedPrompts.push(prompt);
    });
  }

  return { cards, prompts: enhancedPrompts };
}

export async function createImage(prompt: string,  modelType: ModelType,
 ): Promise<ITextToImage> {
  return createImageWithClient(runware, prompt, modelType);
}

export async function createImages(
  prompts: string[],
  modelType: ModelType,
): Promise<ITextToImage[]> {
  const allImages: ITextToImage[] = [];

  // Process prompts in chunks of 5
  const promptChunks = chunkArray(prompts, 5);

  for (const chunk of promptChunks) {
    // Process each chunk in parallel
    const chunkPromises = chunk.map(async (prompt) => {
      return createImageWithClient(runware, prompt, modelType);
    });

    // Wait for all images in this chunk to complete
    const chunkImages = await Promise.all(chunkPromises);
    allImages.push(...chunkImages);
  }

  return allImages;
}
