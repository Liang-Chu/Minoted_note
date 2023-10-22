import React, { useState, useEffect } from 'react';
import path from 'path';
import ReactDOM from 'react-dom';
const { ipcRenderer } = require('electron');
const MarkdownEditor = require('../components/pages/MarkdownEditor').default;

function EditorApp() {
    const [markdownText, setMarkdownText] = useState('');
    const [id, setId] = useState(null); // Add this line to create a state for the id

    // Use useEffect to handle event listener addition and cleanup
    useEffect(() => {
        const handleLoadContent = (event, { content, id }) => {
            console.log("Received content:", content);
            setMarkdownText(content);
            setId(id); // Update the id state here
        };

        ipcRenderer.on('load-content', handleLoadContent);

        // Cleanup the event listener when the component is unmounted
        return () => {
            ipcRenderer.removeListener('load-content', handleLoadContent);
        };
    }, []); // The empty dependency array ensures this effect runs once when the component mounts

    const handleSave = () => {
        ipcRenderer.send('save-file', { id, content: markdownText });
    };

    return (
        <div>
            <MarkdownEditor value={markdownText} onChange={setMarkdownText} onSave={handleSave} />
        </div>
    );
}

// Render the EditorApp component into the div with ID 'root'
ReactDOM.render(<EditorApp />, document.getElementById('root'));
