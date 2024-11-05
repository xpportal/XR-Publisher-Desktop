const { app, BrowserWindow } = require('electron')
const path = require('path')

const VITE_DEV_SERVER_PORT = 5173;
const VITE_DEV_SERVER_URL = `http://localhost:${VITE_DEV_SERVER_PORT}`;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      sandbox: false
    }
  })

  // Set CSP headers
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
	callback({
		responseHeaders: {
		  ...details.responseHeaders,
		  'Content-Security-Policy': [
			"default-src 'self' https://items.sxp.digital https://*.sxpdigital.workers.dev; " +
			`script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net ${VITE_DEV_SERVER_URL}; ` +
			"connect-src 'self' data: blob: " +
			`ws://localhost:${VITE_DEV_SERVER_PORT} ` +
			`${VITE_DEV_SERVER_URL} ` +
			"https://cdn.jsdelivr.net " +
			"https://cfdb.sxpdigital.workers.dev " +
			"https://*.sxpdigital.workers.dev " +
			"https://items.sxp.digital " +
			"https://*.sxp.digital; " +
			"worker-src 'self' blob:; " +
			"img-src 'self' data: blob: https://* http://*; " +
			"media-src 'self' blob: https://items.sxp.digital https://*.sxp.digital; " +
			"style-src 'self' 'unsafe-inline'; " +
			"font-src 'self' data:; " +
			"object-src 'self' https://items.sxp.digital;"
		  ]
		}
	  })
	});

  // For development, load from Vite's dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})