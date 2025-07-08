import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
} from "@azure/storage-blob";

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
/**
 * Generates an uploadEndpoint (SAS URL) for a specific blob in Azure Blob Storage.
 *
 * @param blobName The desired name of the blob in Azure Storage (e.g., 'my-image-123.png').
 * @param expiryMinutes How long the SAS URL will be valid for, in minutes.
 * @returns The full SAS URL string that can be used as Runware's uploadEndpoint.
 */
async function generateRunwareUploadEndpoint(
  blobName: string,
  expiryMinutes: number = 10,
): Promise<string> {
  await containerClient.createIfNotExists();
  const blobClient = containerClient.getBlockBlobClient(blobName);

  // Define permissions:
  // 'c' (create): Allows a client to write a new blob or overwrite an existing blob.
  // 'w' (write): Allows a client to write content to a blob (e.g., via PUT).
  // For Runware's PUT, 'w' might be enough, but 'c' ensures creation if it doesn't exist.
  const permissions = BlobSASPermissions.parse("rcw"); // Create and Write permissions

  const sasOptions = {
    containerName: CONTAINER_NAME,
    blobName: blobName,
    permissions: permissions,
    startsOn: new Date(),
    expiresOn: new Date(new Date().valueOf() + expiryMinutes * 60 * 1000), // e.g., 10 minutes from now
    protocol: SASProtocol.Https, // Always enforce HTTPS
  };

  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential,
  ).toString();

  // Construct the full SAS URL
  // This URL will be: https://youraccount.blob.core.windows.net/runware-uploads/your-image-name.png?sp=cw&st=...
  const uploadEndpoint = `${blobClient.url}?${sasToken}`;

  console.log(`Generated uploadEndpoint for ${blobName}: ${uploadEndpoint}`);
  return uploadEndpoint;
}

// --- Example Usage in a Backend API Endpoint ---
// This function would typically be part of an API endpoint your frontend calls.
export async function createUploadEndpoint(
  originalFilename: string,
): Promise<string> {
  // Generate a unique blob name to avoid collisions
  const uniqueBlobName = `runware-image-${Date.now()}-${originalFilename.replace(/[^a-z0-9.]/gi, "_")}`; // Simple sanitization

  try {
    const uploadEndpoint = await generateRunwareUploadEndpoint(
      uniqueBlobName,
      15,
    ); // SAS valid for 15 minutes
    return uploadEndpoint;
  } catch (error) {
    console.error("Error generating Runware upload endpoint:", error.message);
    throw new Error("Failed to prepare image upload endpoint.");
  }
}

export async function uploadImageToAzure(
  imageUrl: string,
  imageUUID: string,
): Promise<string> {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(imageUUID);

    console.log(
      `\nAttempting to upload from URL: ${imageUrl} to blob: ${imageUUID}`,
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
