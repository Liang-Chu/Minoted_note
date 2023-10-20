const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;
const DEFAULT_NOTES_DIR = path.join(__dirname, 'notes');
let currentDirectory = DEFAULT_NOTES_DIR; // Global state in main process

if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
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
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();
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
ipcMain.on('update_currDir', (event, newStateValue) => {
    currentDirectory = require('path').normalize(newStateValue);;
  });
ipcMain.on('set-curr-dir', (event, directory) => {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
    currentDirectory = directory;
});


ipcMain.on('get-folders', (event) => {
    const folders = fs.readdirSync(currentDirectory).filter(file => fs.statSync(path.join(currentDirectory, file)).isDirectory());
    event.reply('send-folders', folders);
});

ipcMain.on('add-folder', (event,  folderName ) => {
    const folderPath = path.join(currentDirectory, folderName);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    event.reply('send-folders', fs.readdirSync(currentDirectory).filter(file => fs.statSync(path.join(currentDirectory, file)).isDirectory()));
});

ipcMain.on('delete-folder', (event,  folderName ) => {
    const folderPath = path.join(currentDirectory, folderName);
    if (!fs.existsSync(folderPath)) {
        event.reply('folder-error', 'Folder does not exist.');
        return;
    }

    try {
        fs.rmdirSync(folderPath, { recursive: true });
        event.reply('send-folders', fs.readdirSync(currentDirectory).filter(file => fs.statSync(path.join(currentDirectory, file)).isDirectory()));
    } catch (error) {
        event.reply('folder-error', `Error deleting the folder: ${error.message}`);
    }
});

ipcMain.on('rename-folder', (event, { oldName, newName }) => {
    const oldFolderPath = path.join(currentDirectory, oldName);
    const newFolderPath = path.join(currentDirectory, newName);

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
        event.reply('send-folders', fs.readdirSync(currentDirectory).filter(file => fs.statSync(path.join(currentDirectory, file)).isDirectory()));
    } catch (error) {
        event.reply('folder-error', `Error renaming the folder: ${error.message}`);
    }
});
