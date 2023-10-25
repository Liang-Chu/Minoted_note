const fs = require('fs');
const path = require('path');
const { fileStructureDB } = require('../../data_structures/direct_db');

function scanDirectory(directory) {
  fs.readdir(directory, (err, items) => {
    if (err) throw err;

    items.forEach(item => {
      const itemPath = path.join(directory, item);

      // Check if item is a directory or file
      fs.stat(itemPath, (err, stats) => {
        if (err) throw err;

        if (stats.isDirectory()) {
          // Recursively scan the sub-directory
          scanDirectory(itemPath);
        }

        // Check if item already exists in the database
        fileStructureDB.findOne({ path: itemPath }, (err, doc) => {
          if (err) throw err;

          if (!doc) {
            // If item doesn't exist in the database, add it
            const entry = {
              path: itemPath,
              parents: [],  // This will be populated later based on your DAG structure
              children: []  // This will be populated later based on your DAG structure
            };

            fileStructureDB.insert(entry, (err, newDoc) => {
              if (err) throw err;
              console.log('Added to database:', newDoc);
            });
          }
        });
      });
    });
  });
}

module.exports = {
  scanDirectory
};
