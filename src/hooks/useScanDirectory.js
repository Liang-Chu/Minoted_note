import { useState } from "react";
import { ipcRenderer } from "electron";
import { useNotebookDB } from "./useNotebookDB";

const useScanDirectory = () => {
  const [directoryContents, setDirectoryContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addList } = useNotebookDB("1f"); // Replace "1f" with the actual notebook identifier

  const scanDirectory = async (directoryPath) => {
    setLoading(true);
    setError(null);
    try {
      const paths = await ipcRenderer.invoke("scan-directory", directoryPath);
      console.log("Scanned paths:", paths);

      // Map the paths to the format expected by addList
      const entriesToAdd = paths.map((filePath) => ({
        relativePath: filePath, // Assuming the paths returned are relative
        parents: [], // Leave parents empty as per your instruction
        children: [] // Leave children empty as per your instruction
      }));

      // Use addList to add all entries
      await addList(entriesToAdd);

    } catch (error) {
      console.error("Error scanning dir:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { directoryContents, loading, error, scanDirectory };
};

export default useScanDirectory;
