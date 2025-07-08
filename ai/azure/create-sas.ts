import {
  ContainerClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

async function generateReadSasTokenForBlob(
  containerClient: ContainerClient,
  sharedKeyCredential: StorageSharedKeyCredential,
  blobName: string,
  expiryMinutes: number = 60,
): Promise<string> {
  const blobClient = containerClient.getBlobClient(blobName);

  const sasOptions = {
    containerName: containerClient.containerName,
    blobName: blobName,
    permissions: BlobSASPermissions.parse("r"), // Read-only permission
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000), // e.g., 60 minutes from now
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential,
  ).toString();

  // Construct the full URL with the SAS token
  // This URL will look like: https://youraccount.blob.core.windows.net/my-image-container/my-image.jpg?sp=r&st=...
  return `${blobClient.url}?${sasToken}`;
}

// Example usage in a hypothetical API endpoint:
// This function would be called by your API when a user requests an image.
export async function getSignedImageUrl(
  containerClient: ContainerClient,
  sharedKeyCredential: StorageSharedKeyCredential,
  imageFilename: string,
  expiryMinutes?: number,
): Promise<string> {
  try {
    const imageUrl = await generateReadSasTokenForBlob(
      containerClient,
      sharedKeyCredential,
      imageFilename,
      expiryMinutes,
    );
    console.log(`Generated SAS URL for ${imageFilename}: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`Error generating SAS for ${imageFilename}:`, error.message);
    throw new Error("Could not generate signed image URL.");
  }
}
