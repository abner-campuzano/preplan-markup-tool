import { useEffect, useRef } from "react";
import { CustomContainer, load } from "./DragAndDropComponent/DragAndDrop";

export default function PdfViewerComponent(props) {
    const containerRef = useRef();

    useEffect(() => {
        const container = containerRef.current;
        let PSPDFKit;

        (async function () {
            PSPDFKit = await import("pspdfkit");
            await load({
                // Container where PSPDFKit should be mounted.
                container,
                // The document to open.
                document: props.document,
                // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
                baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
                // Abner Add:
                objectId: props.objectId
            });

        })();


        return () => PSPDFKit && PSPDFKit.unload(container);
    });

    return (
        <CustomContainer ref={containerRef} />
    );
}