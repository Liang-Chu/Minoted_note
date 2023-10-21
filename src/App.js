// entry point for react
import React, { useState } from 'react';
import path from 'path';
import ReactDOM from 'react-dom';
import Home from './components/pages/Home.js'; // Import the Home component
import CurrentDirContext from './contexts/CurrentDirContext.js'; // Import the CurrentDirContext component
import RootDirContext from './contexts/RootDirContext.js'; // Import the RootDirContext component

const { ipcRenderer } = window.require("electron");

function App() {
  const [currDir, setCurrDir] = useState(path.join(__dirname, './notes'));
  const rootDir = path.join(__dirname, './notes'); // Set the root path for notes

  return (
    <RootDirContext.Provider value={rootDir}>
      <CurrentDirContext.Provider value={{ currDir, setCurrDir }}>
        <Home />
      </CurrentDirContext.Provider>
    </RootDirContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
