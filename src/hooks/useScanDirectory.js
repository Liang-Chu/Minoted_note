// useScanDirectory.js
import fs from 'fs';
import path from 'path';
import { useNotebookDB } from './useNotebookDB';

const useScanDirectory = (notebookName) => {
  const { addEntry, findEntryById } = useNotebookDB(notebookName);

  const scanDirectory = async (directory, parentPath) => {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);

      const type = stats.isDirectory() ? 1 : 0;
      const parents = parentPath ? [await findEntryIdByPath(parentPath)] : [];
      const children = stats.isDirectory() ? await getChildrenIds(itemPath) : [];

      addEntry(itemPath, type, parents, children)
        .then(newDoc => console.log('Added to database:', newDoc))
        .catch(err => console.error('Error adding entry:', err));

      if (stats.isDirectory()) {
        await scanDirectory(itemPath, directory);
      }
    }
  };

  const findEntryIdByPath = async (itemPath) => {
    const entry = await findEntryById(itemPath);
    return entry ? entry.id : null;
  };

  const getChildrenIds = async (directory) => {
    const items = fs.readdirSync(directory);
    const childrenIds = [];

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const childEntry = await findEntryById(itemPath);
      if (childEntry) {
        childrenIds.push(childEntry.id);
      } else {
        // If the child is not in the database, add it
        const stats = fs.statSync(itemPath);
        const type = stats.isDirectory() ? 1 : 0;
        const newChild = await addEntry(itemPath, type, [], []);
        childrenIds.push(newChild.id);
      }
    }

    return childrenIds;
  };

  return scanDirectory;
};

export default useScanDirectory;
