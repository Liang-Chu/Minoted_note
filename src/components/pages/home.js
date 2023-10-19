import React, { useState, useEffect } from 'react';
import '../../styles/style.css';
import GetNameModal from '../modals/getNamePrompt.js'; // Import the modal component

const { ipcRenderer } = window.require('electron');

function Home() {
    // State variables
    const [folders, setFolders] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [folderToRename, setFolderToRename] = useState(null); // Hold the name of the folder to rename

    // Fetch folders from the main process when the component mounts
    useEffect(() => {
        ipcRenderer.send('get-folders');

        // Listen for the response containing the folder list
        ipcRenderer.on('send-folders', (event, foldersList) => {
            setFolders(foldersList);
        });

        // Clean up event listeners when the component unmounts
        return () => {
            ipcRenderer.removeAllListeners('send-folders');
        };
    }, []);

    // Handle folder creation
    const handleFolderCreation = (folderName) => {
        ipcRenderer.send('add-folder', folderName);

        // Listen for the response containing the updated folder list
        ipcRenderer.once('send-folders', (event, foldersList) => {
            setFolders(foldersList);
        });

        // Close the modal after creating the folder
        setModalOpen(false);
    };

    // Handle folder deletion
    const handleFolderDeletion = (folderName) => {
        ipcRenderer.send('delete-folder', folderName);

        // Listen for the response containing the updated folder list
        ipcRenderer.once('send-folders', (event, foldersList) => {
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
        ipcRenderer.send('rename-folder', { oldName: folderToRename, newName });

        // Listen for the response containing the updated folder list
        ipcRenderer.once('send-folders', (event, foldersList) => {
            setFolders(foldersList);
        });

        // Close the modal and reset the folder to rename
        setModalOpen(false);
        setFolderToRename(null);
    };

    return (
        <div>
            <button onClick={() => setModalOpen(true)}>Add Folder</button>
            <ul>
                {folders.map(folder => (
                    <li key={folder}>
                        {folder}
                        <button onClick={() => handleFolderDeletion(folder)}>Delete</button>
                        <button onClick={() => startFolderRename(folder)}>Rename</button>
                    </li>
                ))}
            </ul>

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
