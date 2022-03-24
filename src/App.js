import './App.css';
import React from 'react';
import PdfViewerComponent from './components/PdfViewerComponent';
import queryString from 'query-string';
import * as api_client from './services/api_client';

export default function App() {
  const queryParams = queryString.parse(window.location.search);


  const documetURL = api_client.get_preplan(queryParams.preplanId)



  return (
    <div className="App" style={{ width: "100%", height: "100vh" }}>
      <PdfViewerComponent document={documetURL} />
    </div >
  )
}

