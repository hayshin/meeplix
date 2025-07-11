import { ContainerClient } from "@azure/storage-blob";
import { BlobHTTPHeaders } from "@azure/storage-blob";

export async function uploadImageToAzureContainer(
  containerClient: ContainerClient,
  imageUrl: string,
  blobName: string,
): Promise<string> {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const blobHttpHeaders: BlobHTTPHeaders = {
      blobContentType: "image/jpeg", // IMPORTANT: Set the correct Content-Type for your image
      blobCacheControl: "public, max-age=86400", // Cache for 1 year (365 days * 24 hours * 60 minutes * 60 seconds)
    };

    const uploadOptions = {
      blobHTTPHeaders: blobHttpHeaders,
    };
    console.log(
      `\nAttempting to upload from URL: ${imageUrl} to blob: ${blobName}`,
    );

    // Use syncUploadFromURL to directly copy content from the source URL
    // The source URL must be publicly accessible or have a SAS token if it's also in Azure.
    await blockBlobClient.syncUploadFromURL(imageUrl, uploadOptions);

    console.log("Upload from URL completed successfully!");
    return blockBlobClient.url;
  } catch (error) {
    console.error("Error uploading from URL: ", error);
    throw error;
  }
}
