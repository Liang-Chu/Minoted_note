

// NotebookProvider.js

import React, { useState } from 'react';
import NotebookContext from './NotebookContext';

function CurrentDirProvider({ children }) {
  const [currNotebook, setcurrNotebook] = useState('');

  return (
    <NotebookContext.Provider value={{ currNotebook, setcurrNotebook }}>
      {children}
    </NotebookContext.Provider>
  );
}

export default NotebookProvider;
