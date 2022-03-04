import logo from './logo.svg';
import './App.css';
import PdfViewerComponent from './components/PdfViewerComponent';

function App() {
  return (
    <div className="App">
     
      <PdfViewerComponent
				document={"2045.pdf"}
			/>
    </div>
  );
}

export default App;
