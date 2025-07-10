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
  return `${sasToken}`;
}

// blobName -> token
const sasTokens = new Map<string, string>();

// Example usage in a hypothetical API endpoint:
// This function would be called by your API when a user requests an image.
export async function getReadSasToken(
  containerClient: ContainerClient,
  sharedKeyCredential: StorageSharedKeyCredential,
  blobName: string,
  newToken?: boolean,
  expiryMinutes?: number,
): Promise<string> {
  try {
    if (sasTokens.has(blobName) && !newToken) {
      return sasTokens.get(blobName)!;
    }
    const sasToken = await generateReadSasTokenForBlob(
      containerClient,
      sharedKeyCredential,
      blobName,
      expiryMinutes,
    );
    console.log(`Generated SAS URL for ${blobName}: ${sasToken}`);
    sasTokens.set(blobName, sasToken);
    return sasToken;
  } catch (error) {
    console.error(`Error generating SAS for ${blobName}:`, error);
    throw new Error("Could not generate signed image URL.");
  }
}
