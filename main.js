const { app, BrowserWindow } = require('electron')
const path = require('path')

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
			"default-src 'self' https://items.sxp.digital; " +
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
			"connect-src 'self' data: blob: " +
			"https://cdn.jsdelivr.net " +
			"https://cfdb.sxpdigital.workers.dev " +
			"https://items.sxp.digital " +
			"https://*.sxp.digital; " +  // Allow all subdomains
			"worker-src 'self' blob:; " +
			"img-src 'self' data: blob: https://* http://*; " +  // Broader image source allowance
			"media-src 'self' blob: https://items.sxp.digital https://*.sxp.digital; " +
			"style-src 'self' 'unsafe-inline'; " +
			"font-src 'self' data:; " +
			"object-src 'self' https://items.sxp.digital; " +  // For 3D models
			"model-src 'self' https://items.sxp.digital https://*.sxp.digital"  // Specific for 3D models
		  ],
}
    })
  });

  // For development, load from Vite's dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile('index.html')
  }

  win.webContents.openDevTools()
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
