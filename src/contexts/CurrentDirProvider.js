// CurrentDirProvider.js

import React, { useState } from 'react';
import CurrentDirContext from './CurrentDirContext';

function CurrentDirProvider({ children }) {
  const [currDir, setCurrDir] = useState('');

  return (
    <CurrentDirContext.Provider value={{ currDir, setCurrDir }}>
      {children}
    </CurrentDirContext.Provider>
  );
}

export default CurrentDirProvider;
