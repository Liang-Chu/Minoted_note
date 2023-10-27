// useScanDirectory.js
import fs from 'fs';
import path from 'path';
import { useNotebookDB } from './useNotebookDB';

const useScanDirectory = (notebookName) => {
  const { addEntry } = useNotebookDB(notebookName);

  const scanDirectory = (directory, parentPath) => {
    fs.readdir(directory, (err, items) => {
      if (err) throw err;

      items.forEach(item => {
        const itemPath = path.join(directory, item);

        fs.stat(itemPath, (err, stats) => {
          if (err) throw err;

          if (stats.isDirectory()) {
            scanDirectory(itemPath, directory);
          }

          const type = stats.isDirectory() ? 1 : 0;
          const parents = parentPath ? [parentPath] : [];
          const children = stats.isDirectory() ? fs.readdirSync(itemPath).map(child => path.join(itemPath, child)) : [];

          addEntry(itemPath, type, parents, children)
            .then(newDoc => console.log('Added to database:', newDoc))
            .catch(err => console.error('Error adding entry:', err));
        });
      });
    });
  };

  return scanDirectory;
};

export default useScanDirectory;
