import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import path from "path"; // Import the path module
import NotebookStructureDb from "../data_structures/notebook_structure_db"; // Import the notebook_id_db class
import NotebookIdDb from "../data_structures/notebook_id_db"; // Import the notebook_id_db class


export const useNotebookDB = (notebookName) => {
  // const {notebookName} = useContext(NotebookContext);

  // Initialize databases
  const idPathDB = new NotebookIdDb(notebookName); // Use the new keyword to call the constructor
  const fileStructureDB = new NotebookStructureDb(notebookName); // Use the new keyword to call the constructor


  const addEntry = (path, parent, children) => {
    return new Promise((resolve, reject) => {
      // Call the insert function directly with the provided path, parent, and children
      fileStructureDB.insert(path, parent, children)
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Function: findAllEntries
   *
   * Description:
   * This function retrieves and combines data from two databases: idPathDB and fileStructureDB.
   * It does not take any explicit input parameters as it is designed to retrieve all entries from both databases.
   *
   * Input:
   * - None (It operates on the predefined databases idPathDB and fileStructureDB)
   *
   * Output:
   * - Returns a Promise that resolves to an array of combined entries.
   * - Each entry in the array is an object with the following properties:
   *   - id: The ID from the fileStructureDB entry.
   *   - path: The path from the corresponding idPathDB entry, or null if no corresponding entry is found.
   *   - type: The type from the fileStructureDB entry.
   *   - parents: The parents from the fileStructureDB entry.
   *   - children: The children from the fileStructureDB entry.
   * - If an error occurs during data retrieval from either database, the Promise is rejected with the encountered error.
   */

  const findAllEntries = () => {
    // Return a new Promise to handle asynchronous operations.
    return new Promise((resolve, reject) => {
      // Retrieve all entries from the idPathDB database.
      idPathDB.find({}, (err, idPathEntries) => {
        // If there's an error during retrieval, reject the promise with the error.
        if (err) {
          reject(err);
          return;
        }

        // Retrieve all entries from the fileStructureDB database.
        fileStructureDB.find({}, (err, fileStructureEntries) => {
          // If there's an error during retrieval, reject the promise with the error.
          if (err) {
            reject(err);
            return;
          }

          // Combine the data from both databases.
          const combinedEntries = fileStructureEntries.map((fileEntry) => {
            // Find the corresponding entry from idPathDB based on the id.
            const idPathEntry = idPathEntries.find(
              (idEntry) => idEntry.id === fileEntry.id
            );

            // Return a new object combining data from both entries.
            // If no corresponding idPathEntry is found, path is set to null.
            return {
              id: fileEntry.id,
              path: idPathEntry ? idPathEntry.path : null,
              type: fileEntry.type,
              parents: fileEntry.parents,
              children: fileEntry.children,
            };
          });

          // Resolve the promise with the combined entries.
          resolve(combinedEntries);
        });
      });
    });
  };
  //delete entry by path. And remove subfiles if this is the only parent of them.
  const deleteEntryByPath = (pathToDelete) => {
    const normalizedPath = path.normalize(pathToDelete);
    return new Promise((resolve, reject) => {
      // Step 1: Find the ID corresponding to the path
      findIdPathMapping(idPathDB, normalizedPath)
        .then((entry) => {
          if (!entry) {
            throw new Error("Entry not found.");
          }
          const entryId = entry.id;

          // Step 2: Find the entry in the file structure database
          return findFileStructureEntry(fileStructureDB, entryId);
        })
        .then((entryToDelete) => {
          if (!entryToDelete) {
            throw new Error("File structure entry not found.");
          }

          // Step 3: Update parent entries to remove this entry from their children
          const parentUpdates = entryToDelete.parents.map((parentId) =>
            updateFileStructureEntry(fileStructureDB, parentId, {
              $pull: { children: entryToDelete.id },
            })
          );

          // Step 4: Handle children entries
          const childUpdates = entryToDelete.children.map((childId) =>
            findFileStructureEntry(fileStructureDB, childId).then(
              (childEntry) => {
                if (childEntry.parents.length === 1) {
                  // If this is the only parent, delete the child entry
                  return removeFileStructureEntry(fileStructureDB, childId);
                } else {
                  // Otherwise, remove this entry from the child's parents
                  return updateFileStructureEntry(fileStructureDB, childId, {
                    $pull: { parents: entryToDelete.id },
                  });
                }
              }
            )
          );

          return Promise.all([...parentUpdates, ...childUpdates]);
        })
        .then(() => {
          // Step 5: Delete the entry itself from both databases
          return removeFileStructureEntry(fileStructureDB, entryId);
        })
        .then(() => {
          return removeIdPathMapping(idPathDB, entryId);
        })
        .then(resolve)
        .catch(reject);
    });
  };
  const findEntryById = (id) => {
    return new Promise((resolve, reject) => {
      findFileStructureEntry(fileStructureDB, id)
        .then((fileStructureEntry) => {
          if (!fileStructureEntry) {
            reject(new Error("File structure entry not found."));
            return;
          }
          findIdPathMapping(idPathDB, id)
            .then((idPathEntry) => {
              if (!idPathEntry) {
                reject(new Error("ID-Path mapping not found."));
                return;
              }
              resolve({
                id: id,
                path: idPathEntry.path,
                type: fileStructureEntry.type,
                parents: fileStructureEntry.parents,
                children: fileStructureEntry.children,
              });
            })
            .catch(reject);
        })
        .catch(reject);
    });
  };
  const addList = (entries) => {
    // Map each entry to a promise that resolves when the entry is added
    const addPromises = entries.map((entry) => {
      const { relativePath, parents, children } = entry;
      return addEntry(relativePath, parents, children);
    });

    // Use Promise.all to wait for all add operations to complete
    return Promise.all(addPromises);
  };

  return { addEntry, deleteEntryByPath, findAllEntries, findEntryById ,addList};
};
