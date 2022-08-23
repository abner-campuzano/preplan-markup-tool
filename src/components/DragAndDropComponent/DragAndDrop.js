import PSPDFKit from "pspdfkit";
import * as React from "react";
import ArcGISHelper from "../../services/ArcGIS";

// Assign the PSPDFKit instance to a module variable so we can access it
// everywhere.
let instance = null;

// We track wether or not drag and drop is supported on the device. If not, we
// allow clicking an item to place it as well (e.g on iPhones)
let isDragAndDropSupported = false;

export function load(defaultConfiguration) {
  // We first find out how much space we have available. Based on that, we
  // decide wether to turn on the sidebar or not. 
  const viewWidth = document
    .querySelector(".splitPane")
    .getBoundingClientRect().width;

  // We start by initializing an initial ViewState that hides all toolbars,
  // opens the thumbnail sidebar, and places the sidebar on the other side.
  const initialViewState = new PSPDFKit.ViewState({
    showToolbar: true,
    enableAnnotationToolbar: true,
    sidebarMode: viewWidth > 1100 ? PSPDFKit.SidebarMode.THUMBNAILS : null,
    sidebarPlacement: PSPDFKit.SidebarPlacement.END,
  });

  //Customize Toolbar
  const toolbarItems = PSPDFKit.defaultToolbarItems.filter((item) => {
    return /\b(sidebar-thumbnails|zoom-in|zoom-out|text|note)\b/.test(
      item.type
    );
  });

  toolbarItems.push({
    type: "spacer",
  });



  toolbarItems.push({
    type: "custom",
    id: "download-pdf",
    title: "Download",
    onPress: () => {
      instance.exportPDF().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/pdf" });
        const fileName = defaultConfiguration.preplanId + "(reviewed).pdf";
        if (window.navigator.msSaveOrOpenBlob) {
          window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = objectUrl;
          a.style = "display: none";
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(objectUrl);
          document.body.removeChild(a);
        }
      });
    }
  });

  // A custom item. Inside the onPress callback we can call into PSPDFKit APIs.
  toolbarItems.push({
    type: "custom",
    id: "my-custom-button",
    title: "Submit Changes",
    onPress: function () {

      if (window.confirm("Are you sure you want to submit changes?\r\n\r\nThe marked up preplan will be attached to your Workforce assignment and this page will close.")) {
        ArcGISHelper.attatchPDFtoAssignment(instance, defaultConfiguration.objectId, defaultConfiguration.preplanId).then((response) => {
          if (response.ok) {
            window.location.assign("arcgis-workforce://");
            //window.open("about:blank", "_self").close();
            //window.location.replace("Workforce://");
          }
          else {
            alert("Error. Please try submitting again. If the error persists, contact IT Helpdesk");
          }
        }
        );
      }

    }
  });
  toolbarItems.push({
    type: "custom",
    id: "my-custom-button2",
    title: "No Changes",
    onPress: function () {
      if (window.confirm("Are you sure you want to exit with no changes?")) {
       // window.location.assign("arcgis-workforce://");
        window.open("arcgis-workforce://");
        window.close();
        //window.location.replace("Workforce://");
      }
    }
  });

  // Initialize a new PSPDFKit Viewer with the initial view state and custom
  // stylesheets.
  return PSPDFKit.load({
    ...defaultConfiguration,
    toolbarItems: toolbarItems,
    initialViewState,
    styleSheets: ["/drag-and-drop/static/style.css"],
    annotationTooltipCallback,
  }).then((_instance) => {
    instance = _instance;

    // We only allow dropping elements onto a PDF page.
    instance.contentDocument.ondragover = function (event) {
      isDragAndDropSupported = true;

      const pageElement = closestByClass(event.target, "PSPDFKit-Page");

      if (pageElement) {
        // Allow drop operation
        event.preventDefault();
      }
    };

    instance.contentDocument.ondrop = function (event) {
      isDragAndDropSupported = true;

      const pageElement = closestByClass(event.target, "PSPDFKit-Page");

      if (pageElement) {
        const pageIndex = parseInt(pageElement.dataset.pageIndex);

        const isExternalDrop = event.dataTransfer.files.length > 0;

        if (isExternalDrop) {
          handleExternalDrop(event, pageIndex);
        } else {
          handleInternalDrop(event, pageIndex);
        }
      }
    };

    return instance;
  });
}

// Event handler that is called when a file from outside is dropped onto the PDF
// page.
function handleExternalDrop(event, pageIndex) {
  const file = event.dataTransfer.files[0];
  const allowedExternalMimeTypes = ["image/jpeg", "image/png"];

  if (!allowedExternalMimeTypes.includes(file.type)) {
    return;
  }

  const clientX = event.clientX;
  const clientY = event.clientY;

  // We don't know the dimensions of the image. To do this, we first parse it
  // with the use of this helper function. Note that it will run async so we
  // continue in the callback function.
  parseImageDimensions(file, (dimensions) => {
    const ratio = dimensions.height / dimensions.width;

    // External drag and drop items will have the cursor in the middle of the
    // bounding box.
    // We also scale the image so that the aspect ratio is kept.
    const width = 75;
    const height = width * ratio;

    const clientRect = new PSPDFKit.Geometry.Rect({
      left: clientX - width / 2,
      top: clientY - height / 2,
      width,
      height,
    });

    const pageRect = instance.transformContentClientToPageSpace(
      clientRect,
      pageIndex
    );

    insertImageAnnotation(pageRect, file, pageIndex);
  });

  event.preventDefault();
}

// Event handler that is called when an annotation from the internal toolbar is
// dropped onto a PDF page.
function handleInternalDrop(event, pageIndex) {
  // We know that internal drag and drop objects will have the cursor on the
  // top left left side of the box. We also know the dimensions of the
  // rectangles.
  const clientRect = new PSPDFKit.Geometry.Rect({
    left: event.clientX,
    top: event.clientY,
    width: 500,
    height: 500,
  });
  const pageRect = instance.transformContentClientToPageSpace(
    clientRect,
    pageIndex
  );

  // We generate text data with a string that either prefixes `pspdfkit/text` or
  // `pspdfkit/image`.
  const data = event.dataTransfer.getData("text");

  if (data.startsWith("pspdfkit/text")) {
    const text = data.replace("pspdfkit/text:", "");

    insertTextAnnotation(
      pageRect,
      text,
      pageIndex,
      26 / instance.currentZoomLevel
    );
    event.preventDefault();
  } else if (data.startsWith("pspdfkit/image")) {
    const imageUrl = data.replace("pspdfkit/image:", "");

    fetch(imageUrl)
      .then((r) => r.blob())
      .then((blob) => insertImageAnnotation(pageRect, blob, pageIndex));
    event.preventDefault();
  }
}

// Event handler for preparing image drag and drop
function setDragImageData(event) {
  isDragAndDropSupported = true;
  event.dataTransfer.setData("text", "pspdfkit/image:" + event.target.src);
  event.dataTransfer.setDragImage &&
    event.dataTransfer.setDragImage(event.target, 0, 0);
  event.stopPropagation();
}

// Event handler for preparing text drag and drop
function setDragTextData(event) {
  isDragAndDropSupported = true;
  event.dataTransfer.setData("text", "pspdfkit/text:" + event.target.innerText);
  event.dataTransfer.setDragImage &&
    event.dataTransfer.setDragImage(event.target, 0, 0);
  event.stopPropagation();
}

// Handles click events on draggable image items on non draggable devices
function handleImageClick(event) {
  if (isDragAndDropSupported || !instance) {
    return;
  }

  const target = event.target;

  fetch(target.src)
    .then((r) => r.blob())
    .then((blob) => {
      const pageIndex = instance.viewState.currentPageIndex;
      const pageInfo = instance.pageInfoForIndex(pageIndex);

      insertImageAnnotation(
        new PSPDFKit.Geometry.Rect({
          width: target.width,
          height: target.height,
          left: pageInfo.width / 2 - target.width / 2,
          top: pageInfo.height / 2 - target.height / 2,

        }),
        blob,
        pageIndex
      );
    });
}

// Handles click events on draggable text items on non draggable devices
function handleTextClick(event) {
  if (isDragAndDropSupported || !instance) {
    return;
  }

  const target = event.target;
  const pageIndex = instance.viewState.currentPageIndex;
  const pageInfo = instance.pageInfoForIndex(pageIndex);

  insertTextAnnotation(
    new PSPDFKit.Geometry.Rect({
      width: 220,
      height: 217,
      left: pageInfo.width / 2 - 220 / 2,
      top: pageInfo.height / 2 - 217 / 2,
    }),
    target.innerText,
    pageIndex,
    26
  );
}

// Inserts a text annotation on the page.
// https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
async function insertTextAnnotation(pageRect, text, pageIndex, fontSize) {
  const annotation = new PSPDFKit.Annotations.TextAnnotation({
    boundingBox: pageRect,
    text,
    pageIndex,
    fontSize,
    horizontalAlign: "center",
    verticalAlign: "center",
    backgroundColor: PSPDFKit.Color.WHITE,
  });

  await instance
    .create(annotation)
    .then((annotations) => instance.setSelectedAnnotation(annotations[0]));
}

// Inserts an image annotation on the page.
// https://pspdfkit.com/guides/web/current/annotations/introduction-to-annotations/
async function insertImageAnnotation(pageRect, blob, pageIndex) {
  instance.createAttachment(blob).then((attachmentId) => {
    const annotation = new PSPDFKit.Annotations.ImageAnnotation({
      pageIndex,
      boundingBox: pageRect,
      contentType: "image/jpeg",
      imageAttachmentId: attachmentId
    });

    instance
      .create(annotation)
      .then((annotations) => instance.setSelectedAnnotation(annotations[0]));
  });
}

// The annotation tooltip can be used to place annotation tools directly on top
// of the annotation on screen.
//
// In this example, we use it as an alternative to the default annotation
// toolbars.
//
// https://web-examples.pspdfkit.com/tooltips
function annotationTooltipCallback(annotation) {
  const deleteAnnotation = {
    type: "custom",
    title: "Delete",
    onPress: async () => {
      if (window.confirm("Do you really want to delete the annotation?")) {
        await instance.delete(annotation.id);
      }
    },
  };
  if (annotation instanceof PSPDFKit.Annotations.ImageAnnotation) {
  const rotateLeft = {
    type: "custom",
    title: "Rotate Left",
    onPress: async () => {
      
      let currentRotationVal = annotation.rotation;      

      if (currentRotationVal === 270) {
        const updatedAnnotation = annotation.set("rotation", 0);
        await instance.update(updatedAnnotation);
      }
      else {
        const updatedAnnotation = annotation.set("rotation", currentRotationVal + 90);
        await instance.update(updatedAnnotation);
      }
    },
  };

  const rotateRight = {
    type: "custom",
    title: "Rotate Right",
    onPress: async () => {
      let currentRotationVal = annotation.rotation; 

      if (currentRotationVal === 0) {
        const updatedAnnotation = annotation.set("rotation", 270);
        await instance.update(updatedAnnotation);
      }
      else {
        const updatedAnnotation = annotation.set("rotation", currentRotationVal - 90);
        await instance.update(updatedAnnotation);
      }
    },
  };
  return [rotateLeft, rotateRight];
}

  if (annotation instanceof PSPDFKit.Annotations.TextAnnotation) {
    const increaseFontSize = {
      type: "custom",
      title: "Bigger",
      onPress: async () => {
        annotation = annotation.set("fontSize", annotation.fontSize * 1.2);
        annotation =
          instance.calculateFittingTextAnnotationBoundingBox(annotation);

        await instance.update(annotation);
      },
    };

    const decreaseFontSize = {
      type: "custom",
      title: "Smaller",
      onPress: async () => {
        annotation = annotation.set("fontSize", annotation.fontSize / 1.2);
        annotation =
          instance.calculateFittingTextAnnotationBoundingBox(annotation);

        await instance.update(annotation);
      },
    };

    return [increaseFontSize, decreaseFontSize, deleteAnnotation];
  } 
}

// Given a File object, we can create an <image/> tag to parse the image and
// retrieve the original dimensions.
function parseImageDimensions(file, onDimensions) {
  const url = URL.createObjectURL(file);
  const image = new Image();

  image.onerror = () => URL.revokeObjectURL(url);
  image.onload = () => {
    onDimensions({ width: image.width, height: image.height });
    URL.revokeObjectURL(url);
  };
  image.src = url;
}

const tools = [
  { type: "image", filename: "drag-and-drop/preplan_icons/1.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/2.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/25.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/30.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/16.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/17.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/18.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/22.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/20.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/19.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/32.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/33.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/13.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/39.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/26.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/38.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/37.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/14.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/15.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/24.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/29.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/5.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/6.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/7.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/8.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/9.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/10.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/11.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/12.jpg" },
  { type: "image", filename: "drag-and-drop/preplan_icons/21.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/23.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/3.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/4.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/27.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/28.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/30.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/31.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/34.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/35.png" },
  { type: "image", filename: "drag-and-drop/preplan_icons/36.png" }

];

// By exporting a CustomContainer, we can customize the HTML structure that is
// used by the catalog app.
// We do this so that we can show the sidebar and fill it with some example
// tools.
export const CustomContainer = React.forwardRef((instance, ref) => (
  <div className="splitPane">
    <div className="splitPane-left">
      {tools.map((tool) => {
        if (tool.type === "image") {
          return (
            <div key={tool.filename} className="image-tool tool">

              <img
                alt="Icon Missing"
                src={tool.filename}
                onDragStart={setDragImageData}
                onClick={handleImageClick}
                draggable
              />
            </div>
          );
        } else {
          return (
            <div
              key={tool.text}
              className="text-tool tool"
              onDragStart={setDragTextData}
              onClick={handleTextClick}
              draggable
            >
              {tool.text}
            </div>
          );
        }
      })}
    </div>
    <div className="splitPane-right" ref={ref}>
    </div>
    <style jsx="true">{`
      .splitPane {
        width: 100%;
        height: 100%;
        background: #f6f8fa;
        display: flex;
      }

      .splitPane-left {
        background-color: rgb(250, 251, 251);
        padding: 10px;
      }

      .splitPane-right {
        height: 100%;
        flex-grow: 1;
      }

      .tool {
        margin: 10px;
      }

      .image-tool {
        display: block;
        cursor: pointer;
        
      }

      .image-tool img {
        outline: 2px solid #eee;
        outline-offset: -2px;
        width: 75px;
        height: 75px;
        object-fit:contain;
      }

      .text-tool {
        width: 220px;
        height: 217px;
        cursor: pointer;
        font-size: 26px;
        text-align: center;
        line-height: 217px;
        font-weight: bold;
        border: 2px solid #eee;
        color: #444;
        background: white;
      }

      @media only screen and (min-width: 768px) {
        .splitPane-left {
          width: 150px;
          height: 100vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0 20px;
          box-shadow: 5px 0 5px rgba(200, 200, 200, 0.2);
        }

        .splitPane {
          flex-direction: row;
        }

        .tool {
          display: block;
        }
      }

      @media only screen and (max-width: 767px) {
        .splitPane-left {
          width: auto;
          overflow-y: hidden;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 0px;
          box-shadow: 5px 0 5px rgba(200, 200, 200, 0.2);
          white-space: nowrap;
        }

        .splitPane-right {
          height: calc(100% - 150px);
        }

        .splitPane {
          flex-direction: column;
        }

        .tool,
        .tool > img {          
          display: inline-block;
        }

        .text-tool {
          font-size: 13px;
          line-height: 108px;
        }

        .tool {
          vertical-align: top;
        }
      }
    `}</style>
  </div>
));

function closestByClass(el, className) {
  return el && el.classList && el.classList.contains(className)
    ? el
    : el
      ? closestByClass(el.parentNode, className)
      : null;
}