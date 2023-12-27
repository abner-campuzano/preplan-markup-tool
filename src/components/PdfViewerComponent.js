import React, { useEffect, useRef } from "react";
import { CustomContainer, load } from "./DragAndDropComponent/DragAndDrop";
//import { useState } from "react";
import { useIdleTimer } from 'react-idle-timer'


export default function PdfViewerComponent(props) {    
    const containerRef = useRef();

    const onIdle = () => {
        props.signalTimeout(true);        
    }
    
    const onActive = () => {
        //setState('Active');
    }

    const onAction = () => {
        //setCount(count + 1);
        //console.log("Action");
    }
    const timer = useIdleTimer({
        onIdle,
        onActive,
        onAction,
        timeout: 3600000,// in milliseconds
        throttle: 500
    });

    useEffect(() => {
        const container = containerRef.current;
        let PSPDFKit;
        (async function () {
            PSPDFKit = await import("pspdfkit");
            const docURL = await getDocumentURL(props.preplanId);
            // console.log("UE PdfViewerComponent");

            const pspdfkitKey = await getPSPDFKITKey();          

            if (docURL === "") {
                onIdle();
            } else {
                await load({
                    licenseKey: pspdfkitKey,
                    // Container where PSPDFKit should be mounted.
                    container,
                    // The document to open.
                    document: docURL,
                    // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
                    baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
                    // Abner Add:
                    customRenderers: {
                        Annotation: ({ annotation }) => {
                            //console.log("CUSTOM RENDERER")
                            //reset idle timer when an annotation is rendered
                            timer.reset();
                            return null;
                        }
                    },
                    objectId: props.objectId,
                    preplanId: props.preplanId
                });
            }


        })();

        return () => PSPDFKit && PSPDFKit.unload(container);
    },);


    return (
        <CustomContainer ref={containerRef} />
    );

}
const getPSPDFKITKey = async function(){
    const data = await fetch(`/api/GenerateSAS?fileName=${preplanId}.pdf&permissions=r`);
    const dataJson = await data.json();



    return dataJson.key;
}

const getDocumentURL = async function (preplanId) {
    const data = await fetch(`/api/GenerateSAS?fileName=${preplanId}.pdf&permissions=r`);
    const dataJson = await data.json();
    if (dataJson.preplanInprogressExists) {
        if (window.confirm("Preplan is being edited by someone else. Do you want to take over? Editing on multiple devices at the same time will cause sync issues.")) {
            return dataJson.url;
        }
        else{
            window.location.replace("")
        }
    }
    else {
        return dataJson.url;
    }
}
