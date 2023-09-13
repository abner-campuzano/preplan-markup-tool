// Used to get read-only SAS token URL
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  SASProtocol,
  StorageSharedKeyCredential
} from '@azure/storage-blob';

function getBlobServiceClient(serviceName, serviceKey) {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    serviceName,
    serviceKey
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${serviceName}.blob.core.windows.net`,
    sharedKeyCredential
  );

  return blobServiceClient;
}

async function createContainer(
  containerName,
  blobServiceClient
) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();

  return containerClient;
}

export async function uploadBlob(
  serviceName,
  serviceKey,
  fileName,
  containerName,
  blob
) {
  if (!serviceName || !serviceKey || !fileName || !containerName || !blob) {
    return 'Upload function missing parameters';
  }

  const blobServiceClient = getBlobServiceClient(serviceName, serviceKey);

  const containerClient = await createContainer(
    containerName,
    blobServiceClient
  );
  const blockBlobClient = await containerClient.getBlockBlobClient(fileName);
  try{
    const response = await blockBlobClient.uploadData(blob);
  }
  catch(e){
    return e;
  }
  

  return response.errorCode;
}

export const generateSASUrl = async (
  serviceName,
  serviceKey,
  containerName,
  fileName, // hierarchy of folders and file name: 'folder1/folder2/filename.ext'
  permissions = 'r', // default read only
  timerange = 2 // default 1 minute
) => {
  if (!serviceName || !serviceKey || !fileName || !containerName) {
    return 'Generate SAS function missing parameters';
  }

  const blobServiceClient = getBlobServiceClient(serviceName, serviceKey);
  const containerClient = await createContainer(
    containerName,
    blobServiceClient
  );

  const blockBlobClient = await containerClient.getBlockBlobClient(fileName);

  // Best practice: create time limits
  const SIXTY_MINUTES = timerange * 60 * 1000;
  const NOW = new Date();

  // Create SAS URL
  const accountSasTokenUrl = await blockBlobClient.generateSasUrl({
    startsOn: NOW,
    expiresOn: new Date(new Date().valueOf() + SIXTY_MINUTES),
    permissions: BlobSASPermissions.parse(permissions), // Read only permission to the blob
    protocol: SASProtocol.HttpsAndHttp // Only allow HTTPS access to the blob
  });

  return accountSasTokenUrl;
};

export const listFilesInContainer = async (
  serviceName,
  serviceKey,
  containerName
) => {
  if (!serviceName || !serviceKey || !containerName) {
    return {
      error: true,
      errorMessage: 'List files in container function missing parameters',
      data: []
    };
  }

  const blobServiceClient = getBlobServiceClient(serviceName, serviceKey);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  const data = [];

  for await (const response of containerClient
    .listBlobsFlat()
    .byPage({ maxPageSize: 20 })) {
    for (const blob of response.segment.blobItems) {
      data.push(`${containerClient.url}/${blob.name}`);
    }
  }

  return {
    error: false,
    errorMessage: '',
    data
  };
};

export const blobExists = async (
  serviceName,
  serviceKey,
  containerName,
  blobName
) => {

  if (!serviceName || !serviceKey || !containerName) {
    return {
      error: true,
      errorMessage: 'List files in container function missing parameters',
      data: []
    };
  }
  const blobServiceClient = getBlobServiceClient(serviceName, serviceKey);  
  const containerClient = blobServiceClient.getContainerClient(containerName); 

    // Get a reference to a blob
  const blobClient = containerClient.getBlobClient(blobName);

    // Check if the blob exists
  const blobExists = await blobClient.exists();

  return blobExists;  
};