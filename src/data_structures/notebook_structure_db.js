// src\data_structure\notebook_structure_db.js
// Notebook structure define
// id: unique id for each node. Fist digit indicating it is a folder or file
// parent[]: array of parent ids
// children[]: array of child ids
const Datastore = require("nedb");
const path = require("path");
const notebook_id_db = require("./notebook_id_db");
const { ipcRenderer } = require("electron");

// Defining the notebook_structure_db class
class notebook_structure_db {
  // Constructor for the notebook_structure_db class
  // It initializes the database based on the notebook name
  constructor(notebookName = "default_notebook") {
    // Define the directory where the database should be stored
    const dbDirectory = path.join(__dirname, "/database", notebookName);

    // Send a message to the main process to ensure the directory exists
    ipcRenderer.send("ensure-folder", dbDirectory);

    // Define the filename for the database
    const dbFilename = `structure.db`;

    // Initialize the database with the filename
    // Note: The database will not be loaded until the main process confirms the directory exists
    this.db = new Datastore({
      filename: path.join(dbDirectory, dbFilename),
      autoload: false, // Set autoload to false initially
    });

    // Listen for the main process to confirm the directory is ready
    ipcRenderer.on("folder-ready", (event, success) => {
      if (success ) {
        // If the directory is ready, load the database
        this.db.filename = path.join(dbDirectory, 'structure.db');
        this.db.loadDatabase();
      } else {
        // Handle the error scenario, perhaps by notifying the user or logging
        console.error("Failed to ensure database directory exists.");
      }
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
   */ insert(path, parent, children) {
    return new Promise((resolve, reject) => {
      // First, insert or get the id for the given path
      this.notebookIdDb
        .insert(path)
        .then((id) => {
          // Check if the path is directly under the root folder
          const isDirectlyUnderRoot = (path.match(/\//g) || []).length === 1;
          let natureParentId;

          // If the path is not directly under the root, try insert the parent in case it doesn't exist in id mapping
          if (!isDirectlyUnderRoot) {
            const parentPath = path.substring(0, path.lastIndexOf("/"));
            natureParentId = this.notebookIdDb.insert(parentPath);
          } else {
            natureParentId = Promise.resolve("root");
          }

          natureParentId
            .then((natureParentId) => {
              // Ensure the natural parent is always at the first place of the parent array
              const updatedParent = [
                natureParentId,
                ...parent.filter((p) => p !== natureParentId),
              ];

              // Prepare the document to be inserted
              const doc = {
                _id: id,
                parent: updatedParent,
                children: children,
              };

              // Insert the document into the database
              this.db.insert(doc, (err, newDoc) => {
                if (err) {
                  reject(err);
                } else {
                  // Connect with corresponding parents and children
                  updatedParent.forEach((parentId) => {
                    this.db.update(
                      { _id: parentId },
                      { $push: { children: id } },
                      {}
                    );
                  });
                  children.forEach((childId) => {
                    this.db.update(
                      { _id: childId },
                      { $push: { parent: id } },
                      {}
                    );
                  });

                  resolve(newDoc._id);
                }
              });
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((err) => {
          reject(err);
        });
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
            this.deleteChild(id, childId);
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

  /**
   * Function: update
   *
   * Parameters:
   * - query (string): The unique identifier or path of the document to be updated.
   * - parent (string[]): Array of new parent id.
   * - children (string[]): Array of new child id.
   *
   * Functionality:
   * This function updates the specified document's parent and children arrays. It ensures consistency in the database by also updating the related documents. The function handles the following scenarios:
   *
   * 1. Updates the parent array of the document:
   *    - For each new parent, it adds the document's ID to the parent's children array.
   *    - For each old parent not in the new parent array, it removes the document's ID from the parent's children array.
   *
   * 2. Updates the children array of the document:
   *    - For each new child, it adds the document's ID to the child's parent array.
   *    - For each old child not in the new children array, it removes the document's ID from the child's parent array.
   *
   * 3. Updates the document in the database:
   *    - The document is updated with the new parent and children arrays using its unique ID or path.
   *
   * Returns:
   * - Promise: Resolves with the number of documents updated or rejects with an error.
   */
  update(query, newParent, newChildren) {
    return new Promise((resolve, reject) => {
      let condition;
      if (query.startsWith("1") || query.startsWith("0")) {
        // If the query starts with '0' or '1', assume it's an id
        condition = { _id: query };
      } else {
        // Otherwise, assume it's a path
        condition = { id: query };
      }

      // Find the current document
      this.find(condition)
        .then((docs) => {
          if (docs.length === 0) {
            reject(new Error("Document not found"));
            return;
          }

          const currentDoc = docs[0];
          const oldParent = currentDoc.parent;
          const oldChildren = currentDoc.children;

          // Update parent references
          oldParent.forEach((parentId) => {
            if (!newParent.includes(parentId)) {
              this.db.update(
                { _id: parentId },
                { $pull: { children: query } },
                {}
              );
            }
          });

          newParent.forEach((parentId) => {
            if (!oldParent.includes(parentId)) {
              this.db.update(
                { _id: parentId },
                { $push: { children: query } },
                {}
              );
            }
          });

          // Update children references
          oldChildren.forEach((childId) => {
            if (!newChildren.includes(childId)) {
              this.db.update(
                { _id: childId },
                { $pull: { parent: query } },
                {}
              );
            }
          });

          newChildren.forEach((childId) => {
            if (!oldChildren.includes(childId)) {
              this.db.update(
                { _id: childId },
                { $push: { parent: query } },
                {}
              );
            }
          });

          // Update the document itself
          this.db.update(
            condition,
            { $set: { parent: newParent, children: newChildren } },
            {},
            (err, numReplaced) => {
              if (err) reject(err);
              resolve(numReplaced);
            }
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  addParent(id, newParentId) {
    return new Promise((resolve, reject) => {
      // Add the document's ID to the new parent's children array
      this.db.update(
        { _id: newParentId },
        { $push: { children: id } },
        {},
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Add the new parent to the document's parent array
            this.db.update(
              { _id: id },
              { $push: { parent: newParentId } },
              {},
              (err, numUpdated) => {
                if (err) reject(err);
                resolve(numUpdated);
              }
            );
          }
        }
      );
    });
  }
  addChild(id, newChildId) {
    return new Promise((resolve, reject) => {
      // Add the document's ID to the new child's parent array
      this.db.update(
        { _id: newChildId },
        { $push: { parent: id } },
        {},
        (err) => {
          if (err) {
            reject(err);
          } else {
            // Add the new child to the document's children array
            this.db.update(
              { _id: id },
              { $push: { children: newChildId } },
              {},
              (err, numUpdated) => {
                if (err) reject(err);
                resolve(numUpdated);
              }
            );
          }
        }
      );
    });
  }
  deleteChild(id, childId) {
    return new Promise((resolve, reject) => {
      this.find({ _id: childId })
        .then((childDocs) => {
          if (childDocs.length === 0) {
            resolve(0);
            return;
          }

          const childDoc = childDocs[0];
          // Remove the document from the child's parent array
          const updatedParents = childDoc.parent.filter((pid) => pid !== id);

          if (updatedParents.length === 0) {
            // If it was the only parent, delete the child
            this.delete(childId).then(resolve).catch(reject);
          } else {
            // If there are other parents, update the child's parent array
            this.db.update(
              { _id: childId },
              { $set: { parent: updatedParents } },
              {},
              (err, numUpdated) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(numUpdated);
                }
              }
            );
          }
        })
        .catch(reject);
    });
  }

  deleteParent(id, parentId) {
    return new Promise((resolve, reject) => {
      this.find({ _id: id })
        .then((docs) => {
          if (docs.length === 0) {
            reject(new Error("Document not found"));
            return;
          }

          const doc = docs[0];

          // Check if the parentId is in the parent array
          if (!doc.parent.includes(parentId)) {
            resolve(0); // Parent ID not found, nothing to delete
            return;
          }

          // Remove the parentId from the parent array
          const updatedParents = doc.parent.filter((pid) => pid !== parentId);

          // Update the parent array of the document
          this.db.update(
            { _id: id },
            { $set: { parent: updatedParents } },
            {},
            (err, numUpdated) => {
              if (err) {
                reject(err);
              } else {
                // Call deleteChild for the parentId
                this.deleteChild(parentId, id)
                  .then(() => resolve(numUpdated))
                  .catch(reject);
              }
            }
          );
        })
        .catch(reject);
    });
  }
}

// Exporting the notebook_structure_db class as a module
module.exports = notebook_structure_db;
