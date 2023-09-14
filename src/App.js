import './App.css';
import React from 'react';
import PdfViewerComponent from './components/PdfViewerComponent';
import queryString from 'query-string';
import useIdleTimeout from './lib/useIdleTimeout'
import { useState } from "react";

export default function App() { 
  const [isIdle, setIdle] = useState(false) 

  const handleIdle = () => {
    console.log("CLOSE");
    window.close();
    setIdle(true);
    
}
  const {idleTimer} = useIdleTimeout({ onIdle: handleIdle, idleTime: 20 });  

  const queryParams = queryString.parse(window.location.search);
  // LEGACY const documentURL = `https://preplanios.blob.core.windows.net/preplans/${queryParams.preplanId}.pdf?sp=r&st=2022-03-25T21:41:56Z&se=2032-03-26T05:41:56Z&spr=https&sv=2020-08-04&sr=c&sig=XrhOgs7oZS7aFuDHpTNlg0xlZOnTZ5oVJY%2BX6qakmq4%3D`; 
  const objectId = queryParams.objectId;
  const preplanId = queryParams.preplanId;
  if(!isIdle){
    return (
      <div className="App" style={{ width: "100%", height: "100vh" }}>    
          
          <PdfViewerComponent objectId={objectId} preplanId={preplanId} />    
      </div >
    )
  }else{
    return(
      <div className="App" style={{ width: "100%", height: "100vh" }}>    
          Session timed out.              
      </div >
    )
  }  
}