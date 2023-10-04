import './App.css';
import React, { useState } from 'react';
import PdfViewerComponent from './components/PdfViewerComponent';
import queryString from 'query-string';

export default function App() { 
 
  const [preplanId, setPreplanId] = useState(0);
  const [objectId, setObjectId] = useState(0);
  const [timeout, setTimeout] = useState(false);

  const queryParams = queryString.parse(window.location.search);

  const signalTimeout = (isTimedOut) => {
    setTimeout(isTimedOut)
  } 

  if(preplanId !== queryParams.preplanId ){
    setPreplanId(queryParams.preplanId);
    console.log("preplanID State change")
  }
  if(objectId !== queryParams.objectId){
    setObjectId(queryParams.objectId);
  }
  
  // LEGACY const documentURL = `https://preplanios.blob.core.windows.net/preplans/${queryParams.preplanId}.pdf?sp=r&st=2022-03-25T21:41:56Z&se=2032-03-26T05:41:56Z&spr=https&sv=2020-08-04&sr=c&sig=XrhOgs7oZS7aFuDHpTNlg0xlZOnTZ5oVJY%2BX6qakmq4%3D`; 
  //const objectId = queryParams.objectId;
  //const preplanId = queryParams.preplanId;
  if(!timeout){
    return (
      <div className="App" style={{ width: "100%", height: "100vh" }}>                        
          <PdfViewerComponent objectId={objectId} preplanId={preplanId} signalTimeout={signalTimeout} />    
      </div >
    )
  }
  else{
    window.close();
    return(
      <div className="App" style={{ width: "100%", height: "100vh" }}>                        
          Session timed out. Please close tab.     
      </div >
    )
  }   
   
  
}