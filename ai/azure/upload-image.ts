import { ContainerClient } from "@azure/storage-blob";

export async function uploadImageToAzureContainer(
  containerClient: ContainerClient,
  imageUrl: string,
  blobName: string,
): Promise<string> {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log(
      `\nAttempting to upload from URL: ${imageUrl} to blob: ${blobName}`,
    );

    // Use syncUploadFromURL to directly copy content from the source URL
    // The source URL must be publicly accessible or have a SAS token if it's also in Azure.
    await blockBlobClient.syncUploadFromURL(imageUrl);

    console.log("Upload from URL completed successfully!");
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading from URL:", error.message);
    throw error;
  }
}
