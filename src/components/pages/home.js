import React, { useContext, useState } from "react";
import "../../styles/style.css";
import DisplayFolders from '../utils/DisplayFolders';
import CurrentDirContext from '../../contexts/CurrentDirContext';
import RootDirContext from '../../contexts/RootDirContext';
import NamePrompts from '../modals/NamePrompts';
import fs from 'fs'; // Import Node.js File System module

function Home() {
  const { currDir } = useContext(CurrentDirContext);
  const rootDir = useContext(RootDirContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingNotebooks, setExistingNotebooks] = useState([]);

  console.log("Current directory:", currDir);

  // Function to handle the creation of a new notebook
  const createNotebook = (notebookName) => {
    const notebookPath = `${rootDir}/${notebookName}`;
    fs.mkdir(notebookPath, (err) => {
      if (err) {
        console.error("Error creating notebook:", err);
      } else {
        console.log("Notebook created:", notebookName);
        // Update the existing notebooks list
        setExistingNotebooks([...existingNotebooks, notebookName]);
      }
    });
    setIsModalOpen(false); // Close the modal
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Create Notebook</button>
      <NamePrompts
        isOpen={isModalOpen}
        onSubmit={createNotebook}
        onClose={() => setIsModalOpen(false)}
        existingNames={existingNotebooks}
      />
      <DisplayFolders />
    </div>
  );
}

export default Home;
