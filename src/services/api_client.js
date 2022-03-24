import { BlobServiceClient } from "@azure/storage-blob";

const get_preplan = (preplanId) => {
    const account = "preplanios";
    const sas = "sp=r&st=2022-03-24T21:06:09Z&se=2035-03-25T05:06:09Z&spr=https&sv=2020-08-04&sr=c&sig=cphUawIIrWNAugWNdoeFTl1VyIXDjWTcnVsUyEY8DmY%3D";
    const containerName = "preplans";
    const blobName = `${preplanId}.pdf`;

    const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${sas}`);


    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);


    console.log("Blob CLient ");
    console.log(blobClient);

    return blobClient.downloadToBuffer;

    // // Get blob content from position 0 to the end
    // // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
    // const downloadBlockBlobResponse = await blobClient.download();
    // const downloaded = await blobToString(await downloadBlockBlobResponse.blobBody);
    // console.log("Downloaded blob content", downloaded);

    // // [Browsers only] A helper method used to convert a browser Blob into string.
    // async function blobToString(blob) {
    //     const fileReader = new FileReader();
    //     return new Promise((resolve, reject) => {
    //         fileReader.onloadend = (ev) => {
    //             resolve(ev.target.result);
    //         };
    //         fileReader.onerror = reject;
    //         fileReader.readAsText(blob);
    //     });
    // }

}

export { get_preplan }