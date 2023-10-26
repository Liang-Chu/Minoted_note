// src/contexts/NotebookContext.js

import React from 'react';

const NotebookContext = React.createContext({
  notebookName: '', // Default value
  setNotebookName: () => {} // Placeholder function
});

export default NotebookContext;
