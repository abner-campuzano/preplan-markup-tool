import { error } from 'console';
import { blobExists, generateSASUrl, listFilesInContainer } from '../lib/azure-storage.js';

export default async function (context, req) {

    context.log('JavaScript HTTP trigger function processed a request.');
    try {
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
        else {
            const fileName = req.query.fileName;
            const permissions = req.query.permissions;
            const timerange = '5'; //minutes 

            context.log(`fileName: ${fileName}`);
            context.log(`Azure_Storage_In_Progress_Container: ${process.env?.Azure_Storage_In_Progress_Container}`);

            //Check if Preplan is already being edited       
            const preplanInprogressExists = await blobExists(
                process.env?.Azure_Storage_AccountName,
                process.env?.Azure_Storage_AccountKey,
                process.env?.Azure_Storage_In_Progress_Container,
                fileName
            );

            if (preplanInprogressExists) {
                //Generate SAS URL with In progress Container
                const url = await generateSASUrl(
                    process.env?.Azure_Storage_AccountName,
                    process.env?.Azure_Storage_AccountKey,
                    process.env?.Azure_Storage_In_Progress_Container,
                    fileName,
                    permissions,
                    timerange
                );
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: { url }
                };
            }
            else {
                //Generate SAS URL with original Container
                const url = await generateSASUrl(
                    process.env?.Azure_Storage_AccountName,
                    process.env?.Azure_Storage_AccountKey,
                    process.env?.Azure_Storage_Container,
                    fileName,
                    permissions,
                    timerange
                );
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: { url }
                };
            }
        }
    } catch (error) {
        console.log("ERROR Generating SAS");
        context.res = {
            status: 500, /* Defaults to 200 */
            body: { error, req }
        };
    };
}