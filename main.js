const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow;
let server;
let port;

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      // Serve only index.html (app is fully self-contained)
      const filePath = path.join(__dirname, 'src', 'index.html');
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
    });
    server.listen(0, '127.0.0.1', () => {
      port = server.address().port;
      resolve(port);
    });
  });
}

async function createWindow() {
  const p = await startServer();

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 820,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'MvndiCraft Trade Ledger',
    backgroundColor: '#0d0a05',
    // Remove default menu bar
    autoHideMenuBar: true,
  });

  mainWindow.loadURL(`http://127.0.0.1:${p}`);

  // Allow Firebase Auth popup windows (Google OAuth)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const allowed = [
      'accounts.google.com',
      'firebaseapp.com',
      'googleapis.com',
    ];
    if (allowed.some(d => url.includes(d))) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 520,
          height: 640,
          webPreferences: { nodeIntegration: false, contextIsolation: true },
          autoHideMenuBar: true,
        },
      };
    }
    // Everything else opens in system browser
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
