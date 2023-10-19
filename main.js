const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}

let mainWindow;
const NOTES_DIR = path.join(__dirname, 'notes');

// Ensure the notes directory exists
if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
}

// Fetch all folders from NOTES_DIR
function fetchFolders() {
    return fs.readdirSync(NOTES_DIR).filter(file => fs.statSync(path.join(NOTES_DIR, file)).isDirectory());
}

// Send updated list of folders to renderer process
function sendUpdatedFolders(event) {
    const folders = fetchFolders();
    event.reply('send-folders', folders);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('get-folders', (event) => {
    sendUpdatedFolders(event);
});

ipcMain.on('add-folder', (event, folderName) => {
    const folderPath = path.join(NOTES_DIR, folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    sendUpdatedFolders(event);
});

ipcMain.on('delete-folder', (event, folderName) => {
    const folderPath = path.join(NOTES_DIR, folderName);
    if (!fs.existsSync(folderPath)) {
        event.reply('folder-error', 'Folder does not exist.');
        return;
    }

    try {
        fs.rmdirSync(folderPath, { recursive: true });
        sendUpdatedFolders(event);
    } catch (error) {
        event.reply('folder-error', `Error deleting the folder: ${error.message}`);
    }
});

ipcMain.on('rename-folder', (event, { oldName, newName }) => {
    const oldFolderPath = path.join(NOTES_DIR, oldName);
    const newFolderPath = path.join(NOTES_DIR, newName);

    if (!fs.existsSync(oldFolderPath)) {
        event.reply('folder-error', 'Folder does not exist.');
        return;
    }
    if (fs.existsSync(newFolderPath)) {
        event.reply('folder-error', 'A folder with the new name already exists.');
        return;
    }

    try {
        fs.renameSync(oldFolderPath, newFolderPath);
        sendUpdatedFolders(event);
    } catch (error) {
        event.reply('folder-error', `Error renaming the folder: ${error.message}`);
    }
});
