import React, { useEffect, useState } from 'react';
import path from 'path-browserify';
import useCurrDir from './utils/useCurrDir';
import GetNameModal from './modals/GetNamePrompt.js';
const { ipcRenderer } = window.require("electron");

function DisplayFolderContent() {
    const [currDir, setCurrDir] = useCurrDir('');
    const [folders, setFolders] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [folderToRename, setFolderToRename] = useState(null);

    useEffect(() => {
        ipcRenderer.on('send-folders', (event, foldersList) => {
            setFolders(foldersList);
        });

        ipcRenderer.send('get-folders'); // Request folders initially
        return () => {
            ipcRenderer.removeAllListeners('send-folders');
        };
    }, []);

    const handleFolderClick = (folder) => {
        const newPath = path.join(currDir, folder);
        setCurrDir(newPath);
        ipcRenderer.send('get-folders');
    };

    const handleFolderCreation = (folderName) => {
        ipcRenderer.send("add-folder",  folderName );
        ipcRenderer.once("send-folders", (event, foldersList) => {
            setFolders(foldersList);
        });
        setModalOpen(false);
    };

    const handleFolderDeletion = (folderName) => {
        ipcRenderer.send("delete-folder", folderName );
        ipcRenderer.once("send-folders", (event, foldersList) => {
            setFolders(foldersList);
        });
    };

    const startFolderRename = (folderName) => {
        setFolderToRename(folderName);
        setModalOpen(true);
    };

    const handleFolderRename = (newName) => {
        ipcRenderer.send("rename-folder", { oldName: folderToRename, newName });
        ipcRenderer.once("send-folders", (event, foldersList) => {
            setFolders(foldersList);
        });
        setModalOpen(false);
        setFolderToRename(null);
    };

    return (
        <div>
            <button onClick={() => setModalOpen(true)}>Add Folder</button>

            <ul>
                {folders.map(folder => (
                    <li key={folder}>
                        <span onClick={() => handleFolderClick(folder)}>{folder}</span>
                        <button onClick={() => handleFolderDeletion(folder)}>Delete</button>
                        <button onClick={() => startFolderRename(folder)}>Rename</button>
                    </li>
                ))}
            </ul>

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

export default DisplayFolderContent;
