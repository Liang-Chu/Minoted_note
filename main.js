const path = require("path");
const fs = require("fs");
const { app, BrowserWindow, ipcMain } = require("electron");
const filePaths = new Map();

let mainWindow;
const DEFAULT_NOTES_DIR = path.normalize(path.join(__dirname, "notes"));
let currentDirectory = DEFAULT_NOTES_DIR; // Global state in main process
let editorWindow = null;
function createEditorWindow(notePath) {
  editorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  editorWindow.loadFile("./src/layout/editor.html"); // Load the HTML file for the editor and preview
  editorWindow.webContents.openDevTools();

  // When the window's content finishes loading, read the file and send its content to the renderer process
  editorWindow.webContents.on("did-finish-load", () => {
    const content = fs.readFileSync(notePath, "utf-8");
    editorWindow.webContents.send("load-content", { content, id: editorWindow.webContents.id });

    // Store the file path for this renderer
    filePaths.set(editorWindow.webContents.id, notePath);
  });
  editorWindow.on("closed", () => {
    editorWindow = null;
  });
}

if (process.env.NODE_ENV === "development") {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "node_modules", ".bin", "electron"),
    hardResetMethod: "exit",
  });
}

// Ensure the default notes directory exists
if (!fs.existsSync(DEFAULT_NOTES_DIR)) {
  fs.mkdirSync(DEFAULT_NOTES_DIR, { recursive: true });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
}

//get contens of the current directory
function getDirContents() {
  const items = fs.readdirSync(currentDirectory);
  const folders = items.filter((item) =>
    fs.statSync(path.join(currentDirectory, item)).isDirectory()
  );
  const notes = items.filter((item) => item.endsWith(".md"));
  return { folders, notes };
}
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
//set currentDirectory with new Dir from render
ipcMain.on("setCurrDir", (event, newDir) => {
  if (!fs.existsSync(newDir)) {
    //create if doesnt exist
    fs.mkdirSync(newDir, { recursive: true });
  }
  currentDirectory = newDir;
});

ipcMain.on("getDirContents", (event) => {
  event.reply("sendDirContents", getDirContents());
});
//add folder and update directory contents
ipcMain.on("addFolder", (event, folderName) => {
  const folderPath = path.normalize(path.join(currentDirectory, folderName));
  //add folder
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  event.reply("sendDirContents", getDirContents()); //send back directory contents
});

ipcMain.on("deleteFolder", (event, targetName) => {
  const folderPath = path.normalize(path.join(currentDirectory, targetName));
  //check if the folder exists
  if (!fs.existsSync(folderPath)) {
    event.reply("folderError", "Folder does not exist.");
    return;
  }

  try {
    //delete the target
    fs.rmdirSync(folderPath, { recursive: true });
    event.reply("sendDirContents", getDirContents()); //send back directory contents
  } catch (error) {
    event.reply("folderError", `Error deleting: ${error.message}`);
  }
});
//reanme folder
ipcMain.on("renameFolder", (event, { oldName, newName }) => {
  const oldFolderPath = path.normalize(path.join(currentDirectory, oldName));
  const newFolderPath = path.normalize(path.join(currentDirectory, newName));
  //confirm target does exist
  if (!fs.existsSync(oldFolderPath)) {
    event.reply("folderError", "Folder does not exist.");
    return;
  }
  //confirm new name is not occupied
  if (fs.existsSync(newFolderPath)) {
    event.reply("folderError", "A folder with the new name already exists.");
    return;
  }
  try {
    fs.renameSync(oldFolderPath, newFolderPath);
    event.reply("sendDirContents", getDirContents()); //send back directory contents
  } catch (error) {
    event.reply("folderError", `Error renaming the folder: ${error.message}`);
  }
});

//note manipulation
ipcMain.on("addNote", (event, noteName) => {
  const notePath = path.normalize(
    path.join(currentDirectory, noteName + ".md")
  );
  if (!fs.existsSync(notePath)) {
    fs.writeFileSync(notePath, ""); // Create a new note with an empty content
  }
  event.reply("sendDirContents", getDirContents()); //send back directory contents
});

ipcMain.on("deleteNote", (event, noteName) => {
  const notePath = path.normalize(path.join(currentDirectory, noteName));
  if (!fs.existsSync(notePath)) {
    event.reply("noteError", "Note does not exist.");
    return;
  }

  try {
    fs.unlinkSync(notePath); // Delete the note

    event.reply("sendDirContents", getDirContents()); //send back directory contents
  } catch (error) {
    event.reply("noteError", `Error deleting the note: ${error.message}`);
  }
});

ipcMain.on("renameNote", (event, { oldName, newName }) => {
  const oldNotePath = path.normalize(path.join(currentDirectory, oldName));
  const newNotePath = path.normalize(
    path.join(currentDirectory, newName + ".md")
  );

  if (!fs.existsSync(oldNotePath)) {
    event.reply("noteError", "Note does not exist.");
    return;
  }
  if (fs.existsSync(newNotePath)) {
    event.reply("noteError", "A note with the new name already exists.");
    return;
  }

  try {
    fs.renameSync(oldNotePath, newNotePath); // Rename the note

    event.reply("sendDirContents", getDirContents()); //send back directory contents
  } catch (error) {
    event.reply("noteError", `Error renaming the note: ${error.message}`);
  }
});
ipcMain.on("read-file", (event, notePath) => {
  createEditorWindow(notePath);
});

ipcMain.on("save-file", (event, { id, content }) => {
  // Get the file path for this renderer
  const path = filePaths.get(id);

  // Write the content to the file
  fs.writeFileSync(path, content, "utf-8");
});