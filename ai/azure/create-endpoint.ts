import {
  ContainerClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  SASProtocol,
} from "@azure/storage-blob";

export async function generateRunwareUploadEndpoint(
  containerClient: ContainerClient,
  sharedKeyCredential: StorageSharedKeyCredential,
  containerName: string,
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
    containerName: containerName,
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
