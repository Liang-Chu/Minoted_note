// entry point for react
import React, { useState } from "react";
import path from "path";
import ReactDOM from "react-dom";
import Home from "./components/pages/Home.js";
import CurrentDirContext from "./contexts/CurrentDirContext.js";
import RootDirContext from "./contexts/RootDirContext.js";
import NotebookContext from "./contexts/NotebookContext.js";

const { ipcRenderer } = window.require("electron");

function App() {
  const [currDir, setCurrDir] = useState(path.join(__dirname, "./notes"));
  const rootDir = path.join(__dirname, "./notes");
  const [currNotebook, setcurrNotebook] = useState("1f");

  return (
    <RootDirContext.Provider value={rootDir}>
      <CurrentDirContext.Provider value={{ currDir, setCurrDir }}>
        <NotebookContext.Provider value={{ currNotebook, setcurrNotebook }}>
          {" "}
          {/* Pass "1f" as initial value */}
          <Home />
        </NotebookContext.Provider>
      </CurrentDirContext.Provider>
    </RootDirContext.Provider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
