const Datastore = require('nedb');
const path = require('path');

// Function to initialize the ID-Path mapping database
const initIdPathDB = (notebookName) => {
  const dbFilename = `${notebookName}_id.db`;
  return new Datastore({ filename: path.join(__dirname, 'database', dbFilename), autoload: true });
};

// Utility function to add an ID-Path mapping
const addIdPathMapping = (db, id, path) => {
  return new Promise((resolve, reject) => {
    db.insert({ id, path }, (err, newDoc) => {
      if (err) {
        reject(err);
      } else {
        resolve(newDoc);
      }
    });
  });
};

// Utility function to remove an ID-Path mapping
const removeIdPathMapping = (db, id) => {
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

// Utility function to find an ID-Path mapping by path
const findIdPathMapping = (db, path) => {
  return new Promise((resolve, reject) => {
    db.findOne({ path }, (err, doc) => {
      if (err) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

module.exports = {
  initIdPathDB,
  addIdPathMapping,
  removeIdPathMapping,
  findIdPathMapping
};
