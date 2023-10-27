import React, { useEffect, useState, useContext } from "react";
import path from "path-browserify";
import useCurrDir from "./useCurrDir";
import GetNameModal from "../modals/GetNamePrompt.js";

import RootDirContext from "../../contexts/RootDirContext.js";
import MarkdownEditor from "../pages/MarkdownEditor";
import MarkdownPreview from "../pages/MarkdownPreview";

import useScanDirectory from "../../hooks/useScanDirectory";
import NotebookContext from '../../contexts/NotebookContext';

import DatabaseViewer from "./DatabaseViewer";

const { ipcRenderer, shell } = window.require("electron");

function DisplayFolders() {
  const [currDir, setCurrDir] = useCurrDir("");
  const [folders, setFolders] = useState([]); //states for folders
  const [notes, setNotes] = useState([]); // states for notes
  const [modalAction, setModalAction] = useState(null); // can be "addFolder", "addNote", "renameFolder", etc.

  const { currNotebook } = useContext(NotebookContext);
  const scanDirectory = useScanDirectory(currNotebook);
  const [isModalOpen, setModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState(null);
  const [noteToRename, setNoteToRename] = useState(null);
  const [markdownText, setMarkdownText] = React.useState("");

  const rootDir = useContext(RootDirContext); // Get the root directory
  useEffect(() => {
    ipcRenderer.on("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes); // Set the notes state variable
    });
    ipcRenderer.on("main_to_renderer_update_currDir", (event, directory) => {
      setCurrDir(directory);
    });
    ipcRenderer.send("getDirContents"); // Request folders initially
    return () => {
      ipcRenderer.removeAllListeners("sendDirContents");
    };
  }, []);
  //note click (open note)
  const handleNoteClick = (note) => {
    const notePath = path.join(currDir, note);
    ipcRenderer.send("read-file", notePath);
  };

  const handleNoteCreation = (noteName) => {
    // Send a request to the main process to create a new note
    ipcRenderer.send("addNote", noteName);
    // Listen for the updated list of folders and notes
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
    //close the modal
    setModalOpen(false);
  };

  const handleNoteDeletion = (noteName) => {
    // Send a request to the main process to delete the note
    ipcRenderer.send("deleteNote", noteName);
    // Listen for the updated list of folders and notes
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
  };

  const handleNoteRename = (newName) => {
    ipcRenderer.send("renameNote", { oldName: noteToRename, newName });
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
    setModalOpen(false);
    setNoteToRename(null);
  };

  //folder click(navigate into folder)
  const handleFolderClick = (folder) => {
    const newPath = path.join(currDir, folder);
    setCurrDir(newPath);
    ipcRenderer.send("getDirContents");
  };

  //back
  const handleBackClick = () => {
    const parentPath = path.dirname(currDir);
    setCurrDir(parentPath);
    ipcRenderer.send("getDirContents");
  };
  const handleFolderCreation = (folderName) => {
    //add folder
    ipcRenderer.send("addFolder", folderName);
    //update directory contents
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
    setModalOpen(false);
  };

  const handleFolderDeletion = (folderName) => {
    ipcRenderer.send("deleteFolder", folderName);
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
  };

  const handleFolderRename = (newName) => {
    ipcRenderer.send("renameFolder", { oldName: folderToRename, newName });
    ipcRenderer.once("sendDirContents", (event, { folders, notes }) => {
      setFolders(folders);
      setNotes(notes);
    });
    setModalOpen(false);
    setFolderToRename(null);
  };
  const handleAddFolderClick = () => {
    setModalAction("modal_addFolder");
    setModalOpen(true);
  };

  const handleAddNoteClick = () => {
    setModalAction("modal_addNote");
    setModalOpen(true);
  };
  const handleStartNoteRename = (noteName) => {
    setNoteToRename(noteName);
    setModalAction("modal_renameNote");
    setModalOpen(true);
  };

  const handleStartFolderRename = (folderName) => {
    setFolderToRename(folderName);
    setModalAction("modal_renameFolder");
    setModalOpen(true);
  };

  const handleScanDirectoryClick = () => {
    if (currDir) {
      scanDirectory(currDir, null);
    }
  };

  return (
    <div>
      <button
        onClick={handleBackClick}
        style={{ float: "right" }}
        disabled={path.normalize(currDir) === path.normalize(rootDir)} // Disable the button if currDir is the root directory
      >
        Back
      </button>

      <button onClick={handleAddFolderClick}>Add Folder</button>
      <button onClick={handleAddNoteClick}>Add Note</button>
      <button onClick={handleScanDirectoryClick}>Scan Directory</button>

      <ul>
        {folders.map((folder) => (
          <li key={folder}>
            <span onClick={() => handleFolderClick(folder)}>{folder}</span>
            <button onClick={() => handleFolderDeletion(folder)}>Delete</button>
            <button onClick={() => handleStartFolderRename(folder)}>
              Rename
            </button>
          </li>
        ))}
        {notes.map((note) => (
          <li key={note} style={{ paddingLeft: "10px" }}>
            <span onClick={() => handleNoteClick(note)}>{note}</span>
            <button onClick={() => handleNoteDeletion(note)}>Delete</button>
            <button onClick={() => handleStartNoteRename(note)}>Rename</button>
          </li>
        ))}
      </ul>
      <GetNameModal
        isOpen={isModalOpen}
        onSubmit={
          modalAction === "modal_addFolder"
            ? handleFolderCreation
            : modalAction === "modal_addNote"
            ? handleNoteCreation
            : modalAction === "modal_renameFolder"
            ? handleFolderRename
            : modalAction === "modal_renameNote"
            ? handleNoteRename
            : null
        }
        onClose={() => {
          setModalOpen(false);
          setModalAction(null);
          setFolderToRename(null);
          setNoteToRename(null);
        }}
        existingNames={folders}
      />
    </div>
  );
}

export default DisplayFolders;
