import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { uploadImageToAzureContainer } from "./upload-image";
import { getReadSasToken } from "./create-sas";

const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = "runware-uploads"; // Your container name for Runware images

if (!AZURE_STORAGE_ACCOUNT_NAME || !AZURE_STORAGE_ACCOUNT_KEY) {
  throw new Error(
    "Azure Storage account name or key not found in environment variables.",
  );
}

const sharedKeyCredential = new StorageSharedKeyCredential(
  AZURE_STORAGE_ACCOUNT_NAME,
  AZURE_STORAGE_ACCOUNT_KEY,
);

const blobServiceClient = new BlobServiceClient(
  `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential,
);

const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
await containerClient.createIfNotExists();

export async function uploadImageToAzure(
  imageUrl: string,
  blobName: string,
): Promise<string> {
  return uploadImageToAzureContainer(containerClient, imageUrl, blobName);
}

export async function getImageUrl(
  folder: string,
  imageName: string,
  newToken?: boolean,
): Promise<string> {
  const sasToken = await getReadSasToken(
    containerClient,
    sharedKeyCredential,
    folder + "/",
    newToken,
  );
  const containerUrl = containerClient.url;
  const blobUrl = `${containerUrl}/${folder}/${imageName}`;
  return `${blobUrl}${sasToken}`;
}
