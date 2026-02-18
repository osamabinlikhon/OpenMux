import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../web/dist/index.html')}`;
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Simple sandbox proxy: main process can call sandbox HTTP endpoints and return JSON or images.
ipcMain.handle('sandbox:request', async (event, { method = 'GET', path: reqPath, body, headers = {} }) => {
  const base = process.env.SANDBOX_API_BASE || 'http://localhost:8080';
  const url = new URL(reqPath, base).toString();

  const fetchOpts: any = { method, headers };
  if (body) {
    if (typeof body === 'string' || body instanceof Buffer) fetchOpts.body = body;
    else fetchOpts.body = JSON.stringify(body);
    if (!fetchOpts.headers['content-type']) fetchOpts.headers['content-type'] = 'application/json';
  }

  const res = await fetch(url, fetchOpts);
  const contentType = res.headers.get('content-type') || '';

  if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
    const buffer = Buffer.from(await res.arrayBuffer());
    return { ok: res.ok, status: res.status, isImage: true, data: buffer.toString('base64'), contentType };
  }

  const json = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(json) };
  } catch (e) {
    return { ok: res.ok, status: res.status, text: json };
  }
});
