import React from 'react';

function MarkdownEditor({ value, onChange, onSave }) {  // Notice the onSave prop
    return (
        <div>
            <textarea 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                style={{ width: '100%', height: '90vh' }} 
            />
            <button onClick={onSave}>Save</button>  // Use onSave prop here
        </div>
    );
}

export default MarkdownEditor;
