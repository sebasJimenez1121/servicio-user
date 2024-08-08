import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import dotenv from 'dotenv';

dotenv.config();

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || '';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || '';
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || '';
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`, sharedKeyCredential);

export async function uploadImageToAzure(file: Express.Multer.File): Promise<string> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });

    return blockBlobClient.url;
}

export async function deleteImageFromAzure(imageUrl: string): Promise<void> {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobName = imageUrl.split('/').pop(); // Extrae el nombre del blob de la URL
    if (!blobName) {
        throw new Error("Invalid image URL");
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
}