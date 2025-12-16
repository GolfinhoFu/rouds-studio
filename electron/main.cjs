const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

/**
 * Create and configure the main application BrowserWindow and load the app content.
 *
 * Creates a 1200×800 window titled "Rounds Studio" with a dark background and context-isolated
 * renderer (preload set to preload.cjs), hides the menu bar, and loads the development server
 * URL when in development or the built index.html in production. Opens DevTools in development.
 */
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: '#0d0d12',
        title: "Rounds Studio",
        // icon: path.join(__dirname, '../public/icon.png'), // Commented out until icon exists
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        }
    });

    mainWindow.setMenuBarVisibility(false);

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});