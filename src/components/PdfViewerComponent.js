import { useEffect, useRef } from "react";
import { CustomContainer, load } from "./DragAndDropComponent/DragAndDrop";


export default function PdfViewerComponent(props) {
    const containerRef = useRef();


    useEffect(() => {
        const container = containerRef.current;
        let PSPDFKit;

        (async function () {
            PSPDFKit = await import("pspdfkit");
            const docURL = await getDocumentURL(props.preplanId);
            console.log("USE EFFECT");

            if (docURL === "") {
                window.close();
            } else {
                await load({
                    // Container where PSPDFKit should be mounted.
                    container,
                    // The document to open.
                    document: docURL,
                    // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
                    baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
                    // Abner Add:
                    objectId: props.objectId,
                    preplanId: props.preplanId
                });
            }
        })();

        return () => PSPDFKit && PSPDFKit.unload(container);
    });

    return (
        <CustomContainer ref={containerRef} />
    );
}

// const handleAutoSave = async function(instance, preplanId){
//     const arrayBuffer = await instance.exportPDF(); 

//     //get SAS URL with w permissions
//     const data = await fetch(`/api/GenerateSAS?fileName=${preplanId}.pdf&permissions=w`);    
//     const dataJson = await data.json(); 
//     const sasTokenUrl = dataJson.url

//     //Upload blob
//     const blockBlobClient = new BlockBlobClient(sasTokenUrl);
//     console.log(blockBlobClient);
//     await blockBlobClient.uploadData(arrayBuffer);  
// }

const getDocumentURL = async function (preplanId) {
    const data = await fetch(`/api/GenerateSAS?fileName=${preplanId}.pdf&permissions=r`);
    const dataJson = await data.json();
    if (dataJson.preplanInprogressExists) {
        if (window.confirm("Preplan is being edited by someone else. D you want to take over?")) {
            return dataJson.url;
        }
        else {
            return "";
        }

    }


}