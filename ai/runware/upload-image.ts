import { ITextToImage } from "@runware/sdk-js";
import { uploadImageToAzure } from "../azure";

export function uploadImage(image: ITextToImage): Promise<string> {
  const { imageURL, imageUUID } = image;
  if (!imageURL) {
    throw new Error("Undefined image URL");
  }
  if (!imageUUID) {
    throw new Error("Undefined image UUID");
  }
  return uploadImageToAzure(imageURL, imageUUID);
}

export function uploadImages(images: ITextToImage[]): Promise<string[]> {
  const urls = images.map((image) => uploadImage(image));
  return Promise.all(urls);
}
