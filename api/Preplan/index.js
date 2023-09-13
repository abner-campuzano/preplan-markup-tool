import { blobExists, listFilesInContainer, uploadBlob } from '../lib/azure-storage.js';

export default async function (context, req) {
    context.log('PREPLAN HTTP trigger function processed a request.');

    try {
        //Check Environment Variables
        if (
            !process.env?.Azure_Storage_AccountName ||
            !process.env?.Azure_Storage_AccountKey ||
            !process.env?.Azure_Storage_Container ||
            !process.env?.Azure_Storage_In_Progress_Container
        ) {
            context.res = {
                status: 405, /* Defaults to 200 */
                body: { message: 'Missing required app configuration' }
            };
        }
        if (req.method == "POST") {
            var postBody = req.body;
            var preplanId = postBody.preplanId;
            var blob = postBody.blob;

            context.res = {
                status: 400,
                body: {preplanId}
            }
           
                   
            // if (preplanId && arrayBuffer) {
            //     //Check to see if Markup preplan exists.
            //     var fileName = `${preplanId}.pdf`;
            //     const uploadBlobResponse = await uploadBlob(
            //         process.env?.Azure_Storage_AccountName,
            //         process.env?.Azure_Storage_AccountKey,
            //         fileName,
            //         process.env?.Azure_Storage_Container,
            //         blob
            //     )
            //     context.res = {
            //         body: { uploadBlobResponse }
            //     }
            // }
            // else {
            //     //Bad Request
            //     context.res = {
            //         status: 400,
            //         body: { req: req.body, message: "No preplan id or blob" }
            //     }
            //}
        }
    } catch (error) {
        context.res = {
            status: 500, /* Defaults to 200 */
            body: { error, req }
        };
    }
}