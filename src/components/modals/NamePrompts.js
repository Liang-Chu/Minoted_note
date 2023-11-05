import React, { useState, useEffect, useRef } from 'react';

function NamePrompts({ isOpen, onSubmit, onClose, existingNames }) {
    const [name, setName] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef(null);

    // Automatically focus on the input when the modal opens
    useEffect(() => {
        if (isOpen) {
            setName(''); // Reset name every time modal opens
            setError(false); // Reset error every time modal opens
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleNameSubmit = () => {
        if (existingNames && existingNames.includes(name)) {
            setError(true);  // Set error to true
            return;  // Return early
        }
        onSubmit(name);
        setName('');  // Reset the name after submit
        setError(false); // Reset error after submit
    };

    if (!isOpen) return null;

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Enter name</h2>
                <input 
                    ref={inputRef} 
                    value={name} 
                    onChange={(e) => {
                        if (error) {
                            setError(false);  // Clear error if it was previously set
                        }
                        setName(e.target.value);
                    }} 
                    onKeyUp={(e) => e.key === 'Enter' && handleNameSubmit()}
                />
                {error && <p>This name already exists! Please use a different name.</p>}
                <button onClick={handleNameSubmit}>Submit</button>
                <button onClick={() => { 
                    setName(''); // Reset the name on cancel
                    setError(false); // Reset error on cancel
                    onClose(); 
                }}>Cancel</button>
            </div>
        </div>
    );
}

export default NamePrompts;
