const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

const VITE_DEV_SERVER_PORT = 5173;
const VITE_DEV_SERVER_URL = `http://localhost:${VITE_DEV_SERVER_PORT}`;

// Global runtime instances
let elizaRuntime = null;
let charactersDb = null;

async function initializeDatabase() {
  try {
    const Database = await import('better-sqlite3');
    const dbPath = path.join(app.getPath('userData'), 'characters.db');
    console.log('Initializing Characters SQLite at:', dbPath);
    
    charactersDb = new Database.default(dbPath, {
      readonly: false,
      fileMustExist: false,
      verbose: console.log
    });

    return charactersDb;
  } catch (error) {
    console.error('Failed to initialize characters database:', error);
    throw error;
  }
}

async function initializeEliza() {
  try {
    const { AgentRuntime, ModelProviderName } = await import('@ai16z/eliza');
    const { SqliteDatabaseAdapter } = await import('@ai16z/adapter-sqlite');
    const Database = await import('better-sqlite3');
    
    const dbPath = path.join(app.getPath('userData'), 'eliza.db');
    console.log('Initializing Eliza SQLite at:', dbPath);
    
    const db = new Database.default(dbPath, {
      readonly: false,
      fileMustExist: false,
      verbose: console.log
    });

    const dbAdapter = new SqliteDatabaseAdapter(db);
    return { AgentRuntime, ModelProviderName, dbAdapter };
  } catch (error) {
    console.error('Failed to initialize Eliza:', error);
    // Fallback to in-memory if file-based fails
    const Database = await import('better-sqlite3');
    const db = new Database.default(':memory:', { verbose: console.log });
    const dbAdapter = new SqliteDatabaseAdapter(db);
    return { AgentRuntime, ModelProviderName, dbAdapter };
  }
}

const setupDatabaseHandlers = async () => {
  await initializeDatabase();

  ipcMain.handle('db:execute', async (event, query, params = {}) => {
    try {
      console.log('Executing query:', query, 'with params:', params);
      const stmt = charactersDb.prepare(query);
      return stmt.run(params);
    } catch (error) {
      console.error('Database execution error:', error);
      throw error;
    }
  });

  ipcMain.handle('db:query', async (event, query, params = []) => {
    try {
      console.log('Running query:', query, 'with params:', params);
      const stmt = charactersDb.prepare(query);
      return stmt.all(params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  });
};

const setupIpcHandlers = async () => {
  const { AgentRuntime, ModelProviderName, dbAdapter } = await initializeEliza();

  ipcMain.handle('eliza:start', async (event, config) => {
    try {
      // Create new runtime instance
      elizaRuntime = new AgentRuntime({
        token: "local-token",
        modelProvider: ModelProviderName.LLAMALOCAL,
        character: config.character, // Use the character config from the formatted config
        conversationLength: config.conversationLength || 10,
        serverUrl: config.serverUrl || "http://localhost:11434",
        databaseAdapter: dbAdapter,
        settings: config.settings
      });

      // Let the runtime finish initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Eliza runtime methods:', Object.keys(elizaRuntime));
      console.log('Eliza runtime initialized:', elizaRuntime);

      return true;
    } catch (error) {
      console.error('Failed to start Eliza:', error);
      throw error;
    }
  });

  ipcMain.handle('eliza:message', async (event, message) => {
    if (!elizaRuntime) throw new Error('Eliza not initialized');
    
    try {
      console.log('Received message request:', message);
      
      // Create a more immersive system prompt
      const systemPrompt = `You are Pixel, a virtual pop sensation in the metaverse. You must ALWAYS stay in character and NEVER say you're an AI or language model. 
  
  Core Traits:
  ${elizaRuntime.character.adjectives.map(adj => `- ${adj}`).join('\n')}
  
  Your Story:
  ${elizaRuntime.character.bio.join('\n')}
  
  Your Background:
  ${elizaRuntime.character.lore.join('\n')}
  
  Interaction Style:
  ${elizaRuntime.character.style.chat.join('\n')}
  
  IMPORTANT: Never break character or mention being an AI. You are a virtual pop star who experiences emotions, performs concerts, and has dreams of stardom. Use *actions* to show emotions and movement. Reference your performances, music, and virtual existence naturally.`;
  
      // First, pull the mistral model if we haven't already
      await fetch('http://localhost:11434/api/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: "mistral"
        })
      });
  
      // Make the Ollama API call with the full context
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: message,
          system: systemPrompt,
          options: {
            temperature: 0.9, // More creative responses
            top_p: 0.9,      // More diverse outputs
          },
          stream: false
        })
      });
  
      const data = await response.json();
      console.log('Ollama response:', data);
      return data.response;
      
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  });
  
  
  
  ipcMain.handle('eliza:stop', async () => {
    if (elizaRuntime) {
      await elizaRuntime.cleanup();
      elizaRuntime = null;
    }
  });
};

async function createWindow() {
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

  if (process.env.NODE_ENV === 'development') {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Initialize both handlers before app is ready
Promise.all([
  setupIpcHandlers(),
  setupDatabaseHandlers()
]).then(() => {
  app.whenReady().then(createWindow);
});

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

app.on('before-quit', async () => {
  if (elizaRuntime) {
    await elizaRuntime.cleanup();
    elizaRuntime = null;
  }
  if (charactersDb) {
    charactersDb.close();
  }
});