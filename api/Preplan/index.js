import { deleteBlobIfItExists  } from '../lib/azure-storage.js';

export default async function (context, req) {
    context.log('DELETE MU BLOB HTTP trigger function processed a request.');
   
    if(req.method === "DELETE"){
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
                return;
            }
            const environmentVariables = process.env;
    
            const fileName = req.body.fileName;
    
            if(fileName){
                var response = await deleteBlobIfItExists(
                    environmentVariables.Azure_Storage_AccountName,
                    environmentVariables.Azure_Storage_AccountKey,
                    environmentVariables.Azure_Storage_In_Progress_Container,
                    fileName
                );
            }
            if(!response.succeeded){
                context.log('In progress markup not deleted');
            }else {
                context.log('In progress markup deleted successfully');
            }
            context.res = {
                status: response.succeeded ? 200 : 500 ,
                body: {response} 
            }
            
    
        } catch (error) {
            context.res = {
                status: 500, /* Defaults to 200 */
                body: { error, req }
            };
        }
    }    
}