const Datastore = require('nedb');

// Create a new datastore for file structures
const fileStructureDB = new Datastore({ filename: '../database/direct.db', autoload: true });

// Data model for file structure
const fileStructureModel = {
  path: "",          // The full path of the file/folder.
  type:"note",        // The type of the note/folder.
  parents: [],       // An array of paths representing the multiple parent folders.
  children: []       // An array of paths representing the child nodes (files/folders).
};

module.exports = {
  fileStructureDB,
  fileStructureModel
};