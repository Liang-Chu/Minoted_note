import React, { useContext } from "react";
import "../../styles/style.css";
// Import the component to display folder content
import DisplayFolders from '../DisplayFolders';
// Import the context for the current directory
import CurrentDirContext from '../../contexts/CurrentDirContext';

function Home() {
  const { currDir } = useContext(CurrentDirContext);
  console.log("Current directory:", currDir);  // Log the current directory

  return (
    <div>
      {/* Component to display folder content */}
      <DisplayFolders />
    </div>
  );
}

export default Home;
