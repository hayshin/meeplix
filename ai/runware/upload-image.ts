import { ITextToImage } from "@runware/sdk-js";
import { uploadImageToAzure } from "../azure";

export function uploadImage(
  folder: string,
  image: ITextToImage,
): Promise<string> {
  const { imageURL, imageUUID } = image;
  if (!imageURL) {
    throw new Error("Undefined image URL");
  }
  if (!imageUUID) {
    throw new Error("Undefined image UUID");
  }
  return uploadImageToAzure(imageURL, folder + "/" + imageUUID);
}

export function uploadImages(
  folder: string,
  images: ITextToImage[],
): Promise<string[]> {
  const urls = images.map((image) => uploadImage(folder, image));
  return Promise.all(urls);
}
