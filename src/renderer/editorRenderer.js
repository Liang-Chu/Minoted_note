import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
const { ipcRenderer } = require('electron');
const MarkdownEditor = require('../components/pages/MarkdownEditor').default;

function EditorApp() {
    const [markdownText, setMarkdownText] = useState('');
    const [id, setId] = useState(null);

    useEffect(() => {
        const handleLoadContent = (event, { content, id }) => {
            console.log("Received content:", content);
            setMarkdownText(content);
            setId(id);
        };

        ipcRenderer.on('load-content', handleLoadContent);

        return () => {
            ipcRenderer.removeListener('load-content', handleLoadContent);
        };
    }, []);

    const handleSave = () => {
        ipcRenderer.send('save-file', { id, content: markdownText });
    };

    const openPreviewWindow = () => {
        ipcRenderer.send('open-preview-window', markdownText);
    };

    return (
        <div>
            <MarkdownEditor 
                value={markdownText} 
                onChange={setMarkdownText} 
                onSave={handleSave} 
                onPreview={openPreviewWindow}
            />
        </div>
    );
}

ReactDOM.render(<EditorApp />, document.getElementById('root'));
