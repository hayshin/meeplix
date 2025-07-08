import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
} from "@azure/storage-blob";

const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = "my-image-container"; // Your image container name

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

async function generateReadSasTokenForBlob(
  blobName: string,
  expiryMinutes: number = 60,
): Promise<string> {
  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  const blobClient = containerClient.getBlobClient(blobName);

  const sasOptions = {
    containerName: CONTAINER_NAME,
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
async function getSignedImageUrl(imageFilename: string): Promise<string> {
  try {
    const imageUrl = await generateReadSasTokenForBlob(imageFilename, 15); // Token valid for 15 minutes
    console.log(`Generated SAS URL for ${imageFilename}: ${imageUrl}`);
    return imageUrl;
  } catch (error) {
    console.error(`Error generating SAS for ${imageFilename}:`, error.message);
    throw new Error("Could not generate signed image URL.");
  }
}

const url = getSignedImageUrl("uploaded-image-1751937219893.jpg");

// How you might use it in a simple Express.js API:
/*
import express from 'express';
const app = express();
const port = 3000;

app.get('/api/get-image-url/:filename', async (req, res) => {
  const filename = req.params.filename;
  try {
    const imageUrl = await getSignedImageUrl(filename);
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
*/
