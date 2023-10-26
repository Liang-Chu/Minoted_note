//NotebookProvider.js

import React, { useState } from 'react';
import NotebookContext from './NotebookContext';

const NotebookProvider = ({ children }) => {
  const [notebookName, setNotebookName] = useState('');

  return (
    <NotebookContext.Provider value={{ notebookName, setNotebookName }}>
      {children}
    </NotebookContext.Provider>
  );
};

export default NotebookProvider;
