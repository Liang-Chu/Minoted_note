//entry point for react
import React, { useState } from 'react';
import path from 'path';

import ReactDOM from 'react-dom';
import Home from './components/pages/Home.js'; // Import the Home component
import CurrentDirContext from './contexts/CurrentDirContext.js'; // Import the CurrentDirContext component


function App() {
  const [currDir, setCurrDir] = useState(path.join(__dirname, './notes'));

  return (
    <CurrentDirContext.Provider value={{ currDir, setCurrDir }}>
      <Home />
    </CurrentDirContext.Provider>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
