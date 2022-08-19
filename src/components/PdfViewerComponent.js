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
                licenseKey: 'F02QAlmfuGiJRTQTEf1V6BYsdolECQaNOy2z8a6fhtXpoDOJv8L7fHmyQRfwrRq4CiSSeHI9tf4dPZv2hiXGXo_OaeSenRJq0TfifAcT6AyRrbyeezH5CClp28MMTuuNxCxpTWunUR5MonH--KgvMn5MFDjVlYgObrn68v8-kaJlfEqo3cUEr-dveQbvHAwS0JEfrle9j158e7lIc72JLsX3BJGIy7vaZYVSKuaX6gjFMYf80OP6mzk4l-Pc2SlwKVAyzpcuFegEqoXt3f-quF0gnvrpZXFn7RjEQWqijz9Si6y1QWbedUt0eIKXj7fMDuSIcNzEpge395fmuAlX5JFt8e3UGK2E9p5ouv-g-WkIYsN4yBqy_bG7k0GD7-ny-2qGBZRddbei-J3TRt8wS6bQM4AAAm1cGzF4POdm35vJzCNsGtTo7aURLdN1jEpAKvsOsfsWJ_DNnd2ktQzdqub2xYCv76mQozeZcHfRrnhBmL9TYZFVgID6SNYgsT6RReK-FaSbWZBrHlYicoS4ia22D9_dIM0qAIoqSX8SHXwyX8YTqwkREXYiVTJYF34FCcSEEIUrLIOG4XW6P-X4E4oYJcSqTypu0k1Y3UwgKa-T0c5UFNXn4liKvwDun1rv',
                // Container where PSPDFKit should be mounted.
                container,
                // The document to open.
                document: props.document,
                // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
                baseUrl: `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`,
                // Abner Add:
                objectId: props.objectId,
                preplanId: props.preplanId
            });

        })();


        return () => PSPDFKit && PSPDFKit.unload(container);
    });

    return (
        <CustomContainer ref={containerRef} />
    );
}