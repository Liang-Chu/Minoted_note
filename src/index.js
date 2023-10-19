//entry point for react
import React from 'react';
import ReactDOM from 'react-dom';
import Home from './components/pages/home.js'; // Import the Home component


function App() {
  return <Home />;
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
