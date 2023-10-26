import React, { useState, useEffect } from 'react';
import { fileStructureDB } from '../../data_structures/notebook_structure_db';

function DatabaseViewer() {
    const [data, setData] = useState([]);

    useEffect(() => {
        // Fetch all entries from the database
        fileStructureDB.find({}, (err, docs) => {
            if (err) {
                console.error("Error fetching data from database:", err);
                return;
            }
            setData(docs);
        });
    }, []);

    return (
        <div>
            <h3>Database Contents:</h3>
            <ul>
                {data.map((entry, index) => (
                    <li key={index}>
                        Path: {entry.path} <br />
                        Type: {entry.type} <br />
                        Parents: {entry.parents.join(', ')} <br />
                        Children: {entry.children.join(', ')}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DatabaseViewer;
