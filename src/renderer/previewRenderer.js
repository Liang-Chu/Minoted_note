import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownPreview from '../components/pages/MarkdownPreview';
const { ipcRenderer } = require('electron');

function PreviewApp() {
    const [content, setContent] = React.useState('');

    React.useEffect(() => {
        ipcRenderer.on('load-preview-content', (event, markdownContent) => {
            setContent(markdownContent);
        });
    }, []);

    return <MarkdownPreview value={content} />;
}

ReactDOM.render(<PreviewApp />, document.getElementById('preview-root'));
