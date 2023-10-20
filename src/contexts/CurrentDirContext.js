// CurrentDirContext.js
import React from 'react';

const CurrentDirContext = React.createContext({
  currDir: '',
  setCurrDir: () => {}
});

export default CurrentDirContext;
