import React from 'react';

function MarkdownEditor({ value, onChange, onSave, onPreview }) {
    return (
        <div>
            <textarea 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                style={{ width: '100%', height: '90vh' }} 
            />
            <button onClick={onSave}>Save</button>
            <button onClick={onPreview}>Preview</button>  // This button triggers the preview
        </div>
    );
}

export default MarkdownEditor;
