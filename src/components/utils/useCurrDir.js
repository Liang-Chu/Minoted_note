import { useContext } from 'react';
import { ipcRenderer } from 'electron';
import CurrentDirContext from '../../contexts/CurrentDirContext';

export default function useCurrDir() {

  const { currDir, setCurrDir } = useContext(CurrentDirContext);

  const updateCurrDir = (newPath) => {
    setCurrDir(newPath);
    ipcRenderer.send('update_currDir', newPath);
  };

  return [currDir, updateCurrDir];
}
