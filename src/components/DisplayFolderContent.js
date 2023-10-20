import React, { useContext, useEffect, useState } from 'react';
import CurrentDirContext from '../contexts/CurrentDirContext';
import path from 'path-browserify';
const { ipcRenderer } = window.require("electron");

function DisplayFolderContent({ handleFolderDeletion, startFolderRename, openModal }) {
    const { currDir, setCurrDir } = useContext(CurrentDirContext);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        ipcRenderer.on('send-folders', (event, foldersList) => {
            setFolders(foldersList);
        });

        return () => {
            ipcRenderer.removeAllListeners('send-folders');
        };
    }, []);

    const handleFolderClick = (folder) => {//in progress, not updating render
        const newPath = path.join(currDir, folder);
        setCurrDir(newPath);
        
    }

    return (
        <div>
            <button onClick={openModal}>Add Folder</button>

            <ul>
                {folders.map(folder => (
                    <li key={folder}>
                        <span onClick={() => handleFolderClick(folder)}>{folder}</span>
                        <button onClick={() => handleFolderDeletion(folder)}>Delete</button>
                        <button onClick={() => startFolderRename(folder)}>Rename</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DisplayFolderContent;
