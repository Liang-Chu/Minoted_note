// src\data_structure\notebook_structure_db.js
// Notebook structure define
// id: unique id for each node. Fist digit indicating it is a folder or file
// parent[]: array of parent ids
// children[]: array of child ids
const Datastore = require("nedb");
const path = require("path");
const notebook_id_db = require("./notebook_id_db");
// Defining the notebook_structure_db class
class notebook_structure_db {
  // Constructor for the notebook_structure_db class
  // It initializes the database based on the notebook name
  constructor(notebookName = "default_notebook") {
    // Define the directory and filename for the database
    const dbDirectory = path.join(__dirname, "../../database", notebookName);
    const dbFilename = `structure.db`;

    // Initialize the database
    this.db = new Datastore({
      filename: path.join(dbDirectory, dbFilename),
      autoload: true,
    });

    // Initialize the id database
    this.notebookIdDb = new notebook_id_db(notebookName);
  }

  // Method to find a document in the database
  find(query) {
    return new Promise((resolve, reject) => {
      this.db.find(query, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  /**
   * Method: insert(id, parent, children)
   *
   * Parameters:
   * - path (string): path to the object
   * - parent (string[]): Array of parent id.
   * - children (string[]): Array of child id.
   *
   * Functions:
   * - add new entry. If the file is not already in the id mapping, it will create it.
   * - Will always add nature parent(parent folder in the file system) to parents
   * - if nature parent does not already exist in the id maping and it's parent is not the root, it will create it
   * - will connect with coresponding parents and children
   *
   * Returns:
   * - Promise: Resolves with the id of the inserted document or rejects with an error.
   *
   */
  insert(path, parent, children) {
    return new Promise((resolve, reject) => {
      // First, insert or get the id for the given path
      this.notebookIdDb
        .insert(path)
        .then((id) => {
          // Prepare the document to be inserted
          const doc = {
            _id: id,
            parent: parent,
            children: children,
          };

          // Insert the document into the database
          this.db.insert(doc, (err, newDoc) => {
            if (err) {
              reject(err);
            } else {
              // Check if the path is directly under the root folder
              const isDirectlyUnderRoot =
                (path.match(/\//g) || []).length === 1;

              // If the path is not directly under the root, try insert the parent in case it doesnt exist in id mapping
              if (!isDirectlyUnderRoot) {
                const parentPath = path.substring(0, path.lastIndexOf("/"));
                this.notebookIdDb.insert(parentPath);
              }

              // Connect with corresponding parents and children
              parent.forEach((parentId) => {
                this.db.update(
                  { _id: parentId },
                  { $push: { children: id } },
                  {}
                );
              });
              children.forEach((childId) => {
                this.db.update({ _id: childId }, { $push: { parent: id } }, {});
              });

              resolve(newDoc._id);
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Method to delete a document from the database by id or path
  delete(query) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("n") || query.startsWith("d")) {
        // If the query starts with 'n' or 'd', assume it's an id
        condition = { _id: query };
      } else {
        // Otherwise, assume it's a path
        condition = { id: query };
      }
      this.db.remove(condition, {}, (err, numRemoved) => {
        if (err) reject(err);
        resolve(numRemoved);
      });
    });
  }

  // Method to update a document's parent and children in the database by id or path
  update(query, parent, children) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("n") || query.startsWith("d")) {
        // If the query starts with 'n' or 'd', assume it's an id
        condition = { _id: query };
      } else {
        // Otherwise, assume it's a path
        condition = { id: query };
      }
      this.db.update(
        condition,
        { $set: { parent: parent, children: children } },
        {},
        (err, numReplaced) => {
          if (err) reject(err);
          resolve(numReplaced);
        }
      );
    });
  }
}

// Exporting the notebook_structure_db class as a module
module.exports = notebook_structure_db;
