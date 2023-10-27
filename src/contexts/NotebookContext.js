

// NotebookContext.js
import React from 'react';

const NotebookContext = React.createContext({
  CurrNotebook: '',
  setNotebook: () => {}
});

export default NotebookContext;
