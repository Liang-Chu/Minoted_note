//src\data_structure_notebook_id_db.js
//file path and id mapping
//id: file type+unique id
//path: file path
const Datastore = require("nedb");
const path = require("path");
const fs = require("fs");

class notebook_id_db {
  constructor(notebookName = "default_notebook") {
    // Open database if doesn't exist
    const dbDirectory = path.join(__dirname, "database");
    const dbFilename = `${notebookName}_id.db`;
    this.db = new Datastore({
      filename: path.join(dbDirectory, dbFilename),
      autoload: true,
    });
  }

  // Find a document in the database
  find(query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  // Insert a new map into the database
  insert(path, type) {
    return new Promise((resolve, reject) => {
      // Check if the path already exists in the database
      this.find({ path: path }).then((docs) => {
        if (docs.length > 0) {
          // If the path already exists, display a message and return the existing id
          console.log("Data already exists");
          resolve(docs[0]._id);
        } else {
          // If the path doesn't exist, generate a new id
          let id = type + Date.now().toString(36);
          // Insert the new document into the database
          this.db.insert({ _id: id, path: path }, (err, newDoc) => {
            if (err) reject(err);
            // Return the newly generated id
            resolve(newDoc._id);
          });
        }
      });
    });
  }
  // Delete a document from the database by id or path
  delete(query) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("n") || query.startsWith("d")) {
        // If the query starts with 'n' or 'd', assume it's an id
        condition = { _id: query };
      } else {
        // Otherwise, assume it's a path
        condition = { path: query };
      }
      this.db.remove(condition, {}, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }

  // Update a document's path in the database by id or path
  updatePath(query, newPath) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("n") || query.startsWith("d")) {
        // If the query starts with 'n' or 'd', assume it's an id
        condition = { _id: query };
      } else {
        // Otherwise, assume it's a path
        condition = { path: query };
      }
      this.db.update(
        condition,
        { $set: { path: newPath } },
        {},
        (err, numReplaced) => {
          if (err) reject(err);
          resolve(numReplaced);
        }
      );
    });
  }
}
module.exports = notebook_id_db;
