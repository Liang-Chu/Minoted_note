//src\data_structure\notebook_id_db.js
//file path and id mapping
//id: file type+unique id. If it start with 0 then it is an directory, if it start with 1 then it is a note. And the following digits is generated by create date
//path: file path
const Datastore = require("nedb");
const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");

const { v4: uuidv4 } = require("uuid"); // Import the UUID library
class notebook_id_db {
  constructor(notebookName = "default_notebook") {
    // Define the directory where the database should be stored
    const dbDirectory = path.join(__dirname, "/database", notebookName);

    // Send a message to the main process to ensure the directory exists
    ipcRenderer.send("ensure-folder", dbDirectory);

    // Define the filename for the database
    const dbFilename = `id.db`;

    // Initialize the database with the filename
    // Note: The database will not be loaded until the main process confirms the directory exists
    this.db = new Datastore({
      filename: path.join(dbDirectory, dbFilename),
      autoload: false, // Set autoload to false initially
    });

    // Listen for the main process to confirm the directory is ready
    ipcRenderer.on("folder-ready", (event, success) => {
      if (success) {
        // If the directory is ready, load the database
        this.db.filename = path.join(dbDirectory, "id.db");
        this.db.loadDatabase();
      } else {
        // Handle the error scenario, perhaps by notifying the user or logging
        console.error("Failed to ensure database directory exists.");
      }
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
  /**
   * Method: insert(path)
   *
   * Parameters:
   * - path (string): The path of the document to be inserted.
   *
   * Functionality:
   * - Checks if a document with the given path already exists in the database.
   * - If it does, it returns the existing id.
   * - If it doesn't, it determines the type based on the path (1 for notebooks, 0 for directories), generates a new id, and inserts a new document into the database with this id and path.
   *
   * Returns:
   * - Promise: Resolves with the id of the inserted document or rejects with an error.
   */
  insert(path) {
    return new Promise((resolve, reject) => {
      if (!path) {
        resolve();
        return;
      }
      // Check if the path already exists in the database
      this.find({ path: path })
        .then((docs) => {
          if (docs.length > 0) {
            // If the path already exists, return the existing id
            resolve(docs[0]._id);
          } else {
            // Determine the type based on the path
            let type = path.endsWith(".md") ? "1" : "0";

            // Generate a new id using UUID
            let id = type + uuidv4();
            console.log("id:", id, "path:", path);
            // Insert the new document into the database
            this.db.insert({ _id: id, path: path }, (err, newDoc) => {
              if (err) {
                reject(err);
              } else {
                // Return the newly generated id
                resolve(newDoc._id);
              }
            });
          }
        })
        .catch(reject); // Make sure to catch any errors from `find` method
    });
  }

  /**
   * Function: delete
   *
   * Parameters:
   * - id (string): The unique identifier of the document to be deleted.
   *
   * Functionality:
   * This function performs a cascading delete operation. It not only deletes the specified document but also updates the relationships in the database to maintain consistency. The function handles the following scenarios:
   *
   * 1. Removes the document from its parents' children arrays:
   *    - For each parent of the document, it removes the document's ID from the parent's children array.
   *
   * 2. Handles each child of the document:
   *    - For each child, it removes the document's ID from the child's parent array.
   *    - If the document was the only parent of the child, the child is also deleted.
   *    - If the document was a natural parent and there is another parent available, the child is moved to the second parent. The path of the child in the id mapping is updated accordingly.
   *
   * 3. Deletes the document from the database:
   *    - The document is removed from the database using its unique ID.
   *
   * 4. Deletes the id mapping of the document:
   *    - The id mapping of the document is also removed to ensure no orphaned references are left.
   *
   * Returns:
   * - Promise: Resolves with the number of documents removed or rejects with an error.
   */

  delete(id) {
    return new Promise((resolve, reject) => {
      // First, find the document to be deleted
      this.find({ _id: id })
        .then((docs) => {
          if (docs.length === 0) {
            reject(new Error("Document not found"));
            return;
          }

          const docToDelete = docs[0];
          const parentIds = docToDelete.parent;
          const childrenIds = docToDelete.children;

          // Remove the document from its parents' children array
          parentIds.forEach((parentId) => {
            this.db.update({ _id: parentId }, { $pull: { children: id } }, {});
          });

          // Handle each child
          childrenIds.forEach((childId) => {
            this.find({ _id: childId }).then((childDocs) => {
              if (childDocs.length > 0) {
                const childDoc = childDocs[0];
                // Remove the document from the child's parent array
                const updatedParents = childDoc.parent.filter(
                  (pid) => pid !== id
                );

                if (updatedParents.length === 0) {
                  // If it was the only parent, delete the child
                  this.delete(childId);
                } else {
                  // If it was a natural parent, move the child to the second parent
                  if (updatedParents[0] === id && updatedParents.length > 1) {
                    const newParentId = updatedParents[1];
                    this.find({ _id: newParentId }).then((newParentDocs) => {
                      if (newParentDocs.length > 0) {
                        const newParentDoc = newParentDocs[0];
                        const newPath =
                          newParentDoc.path +
                          "/" +
                          childDoc.path.split("/").pop();
                        this.notebookIdDb.updatePath(childId, newPath);
                      }
                    });
                  }
                  // Update the child's parent array
                  this.db.update(
                    { _id: childId },
                    { $set: { parent: updatedParents } },
                    {}
                  );
                }
              }
            });
          });

          // Finally, delete the document and its id mapping
          this.db.remove({ _id: id }, {}, (err, numRemoved) => {
            if (err) {
              reject(err);
            } else {
              this.notebookIdDb.delete(id);
              resolve(numRemoved);
            }
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  // Update a document's path in the database by id or path
  updatePath(query, newPath) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("0") || query.startsWith("1")) {
        // If the query starts with '0' or '1', assume it's an id
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
