const fs = require('fs');
const path = require('path');
const { useNotebookDB } = require('../../hooks/useNotebookDB');

function scanDirectory(directory, parentPath = null) {
  const { addEntry, deleteEntryByPath, findAllEntries, updateEntry } = useNotebookDB();
  let foundItems = [];

  // Step 1: Clean up the database
  findAllEntries().then(entries => {
    entries.forEach(entry => {
      const itemPath = entry.path;
      if (fs.existsSync(itemPath)) {
        foundItems.push(itemPath);

        // Check for changes in parent or child relationships
        const currentParent = parentPath;
        const currentChildren = fs.readdirSync(itemPath).map(child => path.join(itemPath, child));
        if (entry.parent !== currentParent || !arraysEqual(entry.children, currentChildren)) {
          // Update the database entry with new parent or children
          updateEntry(itemPath, { parent: currentParent, children: currentChildren })
            .then(() => console.log('Updated relationships in database:', itemPath))
            .catch(err => console.error('Error updating entry:', err));
        }
      } else {
        // The entry in the database does not exist in the directory
        deleteEntryByPath(entry.path)
          .then(() => console.log('Removed from database:', entry.path))
          .catch(err => console.error('Error removing entry:', err));
      }
    });

    // Step 2: Scan the directory and add new entries
    fs.readdir(directory, (err, items) => {
      if (err) throw err;

      items.forEach(item => {
        const itemPath = path.join(directory, item);

        // Check if item is a directory or file
        fs.stat(itemPath, (err, stats) => {
          if (err) throw err;

          if (stats.isDirectory()) {
            // Recursively scan the sub-directory
            scanDirectory(itemPath, directory);
          }

          // Check if item already exists in the database
          if (!foundItems.includes(itemPath)) {
            // If item doesn't exist in the database, add it
            const type = stats.isDirectory() ? 1 : 0; // Assuming 1 for folder, 0 for note
            const parents = parentPath ? [parentPath] : [];
            const children = stats.isDirectory() ? fs.readdirSync(itemPath).map(child => path.join(itemPath, child)) : [];

            addEntry(itemPath, type, parents, children)
              .then(newDoc => console.log('Added to database:', newDoc))
              .catch(err => console.error('Error adding entry:', err));
          }
        });
      });
    });
  }).catch(err => console.error('Error finding entries:', err));
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

module.exports = {
  scanDirectory
};
