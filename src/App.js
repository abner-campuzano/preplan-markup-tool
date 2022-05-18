import './App.css';
import React from 'react';
import PdfViewerComponent from './components/PdfViewerComponent';
import queryString from 'query-string';

export default function App() {
  const queryParams = queryString.parse(window.location.search);

  const documentURL = `https://preplanios.blob.core.windows.net/preplans/${queryParams.preplanId}.pdf?sp=r&st=2022-03-25T21:41:56Z&se=2032-03-26T05:41:56Z&spr=https&sv=2020-08-04&sr=c&sig=XrhOgs7oZS7aFuDHpTNlg0xlZOnTZ5oVJY%2BX6qakmq4%3D`;
  const objectId = queryParams.objectId;
  const preplanId = queryParams.preplanId;

  return (
    <div className="App" style={{ width: "100%", height: "100vh" }}>
      <PdfViewerComponent objectId={objectId} preplanId={preplanId} document={documentURL} />
    </div >
  )
}

