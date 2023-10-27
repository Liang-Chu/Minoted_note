const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');

// Function to ensure the database directory exists
const ensureDatabaseDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

// Function to initialize the file structure database
const initFileStructureDB = (notebookName) => {
  const dbDirectory = path.join(__dirname, 'database');
  ensureDatabaseDirectoryExists(dbDirectory); // Ensure the directory exists

  const dbFilename = `${notebookName}_structure.db`;
  return new Datastore({ filename: path.join(dbDirectory, dbFilename), autoload: true });
};

// Utility function to add an entry to the file structure database
const addFileStructureEntry = (db, id, type, parents, children) => {
  return new Promise((resolve, reject) => {
    db.insert({ id, type, parents, children }, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });
};

// Utility function to remove an entry from the file structure database
const removeFileStructureEntry = (db, id) => {
  return new Promise((resolve, reject) => {
    db.remove({ id }, {}, (err, numRemoved) => {
      if (err) {
        reject(err);
      } else {
        resolve(numRemoved);
      }
    });
  });
};

// Utility function to update an entry in the file structure database
const updateFileStructureEntry = (db, id, update) => {
  return new Promise((resolve, reject) => {
    db.update({ id }, update, {}, (err, numUpdated) => {
      if (err) {
        reject(err);
      } else {
        resolve(numUpdated);
      }
    });
  });
};

// Utility function to find an entry in the file structure database
const findFileStructureEntry = (db, id) => {
  return new Promise((resolve, reject) => {
    db.findOne({ id }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

module.exports = {
  initFileStructureDB,
  addFileStructureEntry,
  removeFileStructureEntry,
  updateFileStructureEntry,
  findFileStructureEntry
};
