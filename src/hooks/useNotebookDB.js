import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import path from "path"; // Import the path module
import { NotebookContext } from "../contexts/NotebookContext";
import {
  initFileStructureDB,
  addFileStructureEntry,
  removeFileStructureEntry,
  updateFileStructureEntry,
  findFileStructureEntry,
} from "./notebook_structure_db";
import {
  initIdPathDB,
  addIdPathMapping,
  removeIdPathMapping,
  findIdPathMapping,
} from "./notebook_id";

export const useNotebookDB = () => {
  const { notebookName } = useContext(NotebookContext);

  // Initialize databases
  const idPathDB = initIdPathDB(notebookName);
  const fileStructureDB = initFileStructureDB(notebookName);

  const addEntry = (relativePath, type, parents, children) => {
    return new Promise((resolve, reject) => {
      if (type === undefined || !relativePath) {
        reject(new Error("Type and path are required to add an entry."));
        return;
      }

      const normalizedPath = path.normalize(relativePath);
      const entryId = uuidv4(); // Generate a unique ID for the entry

      // Add entry to idPathDB
      addIdPathMapping(idPathDB, entryId, normalizedPath)
        .then(() => {
          // Add entry to fileStructureDB
          return addFileStructureEntry(
            fileStructureDB,
            entryId,
            type,
            parents,
            children
          );
        })
        .then((newDoc) => {
          resolve(newDoc);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };
  const findAllEntries = () => {
    return new Promise((resolve, reject) => {
      // Retrieve all entries from the idPathDB
      idPathDB.find({}, (err, idPathEntries) => {
        if (err) {
          reject(err);
          return;
        }

        // Retrieve all entries from the fileStructureDB
        fileStructureDB.find({}, (err, fileStructureEntries) => {
          if (err) {
            reject(err);
            return;
          }

          // Combine the data from both databases
          const combinedEntries = fileStructureEntries.map((fileEntry) => {
            const idPathEntry = idPathEntries.find(
              (idEntry) => idEntry.id === fileEntry.id
            );
            return {
              id: fileEntry.id,
              path: idPathEntry ? idPathEntry.path : null,
              type: fileEntry.type,
              parents: fileEntry.parents,
              children: fileEntry.children,
            };
          });

          resolve(combinedEntries);
        });
      });
    });
  };
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

  return { addEntry, deleteEntryByPath, findAllEntries };
};
