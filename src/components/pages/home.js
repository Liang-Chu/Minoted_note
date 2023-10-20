import React, { useState, useEffect, useContext } from "react";
import "../../styles/style.css";
// Import the modal component
import GetNameModal from "../modals/GetNamePrompt.js";
// Import the component to display folder content
import DisplayFolderContent from '../DisplayFolderContent';
// Import the context for the current directory
import CurrentDirContext from '../../contexts/CurrentDirContext';
// Import Electron's IPCRenderer module
const { ipcRenderer } = window.require("electron");

function Home() {
  // State variables
  const { currDir, setCurrDir } = useContext(CurrentDirContext);
  console.log("Current directory:", currDir);  // Log the current directory

  const [folders, setFolders] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null); // Hold the name of the folder to rename

  // Fetch folders from the main process when the component mounts or currDir changes
  useEffect(() => {
    // Send a request to get the list of folders
    ipcRenderer.send("get-folders");

    // Listen for the response containing the folder list
    ipcRenderer.on("send-folders", (event, foldersList) => {
      setFolders(foldersList);
    });

    // Clean up event listeners when the component unmounts
    return () => {
      ipcRenderer.removeAllListeners("send-folders");
    };
  }, [currDir]);  // Add currDir as a dependency

  // Handle folder creation
  const handleFolderCreation = (folderName) => {
    // Send a request to add a new folder
    ipcRenderer.send("add-folder", { path: currDir, folderName });

    // Listen for the response containing the updated folder list
    ipcRenderer.once("send-folders", (event, foldersList) => {
      setFolders(foldersList);
    });

    // Close the modal after creating the folder
    setModalOpen(false);
  };

  // Handle folder deletion
  const handleFolderDeletion = (folderName) => {
    // Send a request to delete a folder
    ipcRenderer.send("delete-folder", { path: currDir, folderName });

    // Listen for the response containing the updated folder list
    ipcRenderer.once("send-folders", (event, foldersList) => {
      setFolders(foldersList);
    });
  };

  // Start the folder renaming process
  const startFolderRename = (folderName) => {
    setFolderToRename(folderName);
    setModalOpen(true);
  };

  // Handle folder renaming
  const handleFolderRename = (newName) => {
    // Send a request to rename a folder
    ipcRenderer.send("rename-folder", { path: currDir, oldName: folderToRename, newName });

    // Listen for the response containing the updated folder list
    ipcRenderer.once("send-folders", (event, foldersList) => {
      setFolders(foldersList);
    });

    // Close the modal and reset the folder to rename
    setModalOpen(false);
    setFolderToRename(null);
  };

  return (
    <div>
      {/* Component to display folder content */}
      <DisplayFolderContent
        folders={folders}
        handleFolderDeletion={handleFolderDeletion}
        startFolderRename={startFolderRename}
        openModal={() => setModalOpen(true)}
      />

      {/* Modal for folder name input */}
      <GetNameModal
        isOpen={isModalOpen}
        onSubmit={folderToRename ? handleFolderRename : handleFolderCreation}
        onClose={() => {
          setModalOpen(false);
          setFolderToRename(null);
        }}
        existingNames={folders}
      />
    </div>
  );
}

export default Home;
