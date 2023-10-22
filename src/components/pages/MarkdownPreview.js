// components/pages/MarkdownPreview.js
import React from 'react';
import ReactMarkdown from 'react-markdown';

function MarkdownPreview({ value }) {
    return (
        <div style={{ padding: '10px', width: '100%', height: '100vh' }}>
            <ReactMarkdown>{value}</ReactMarkdown>
        </div>
    );
}

export default MarkdownPreview;
