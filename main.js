const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { convertFile, convertBatch } = require('./converter');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#1a1a2e',
    frame: true,
    icon: path.join(__dirname, 'icon.png')
  });

  mainWindow.loadFile('index.html');

  // Abrir DevTools en desarrollo (opcional)
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Seleccionar archivos
ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Video Files', extensions: ['avi', 'dv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

// Seleccionar carpeta de salida
ipcMain.handle('select-output-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Convertir un solo archivo
ipcMain.handle('convert-file', async (event, inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    convertFile(
      inputPath,
      outputPath,
      (progress) => {
        mainWindow.webContents.send('conversion-progress', {
          file: inputPath,
          progress: progress
        });
      },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
});

// Convertir múltiples archivos (batch)
ipcMain.handle('convert-batch', async (event, files, outputFolder) => {
  return new Promise((resolve, reject) => {
    convertBatch(
      files,
      outputFolder,
      (file, progress) => {
        mainWindow.webContents.send('batch-progress', {
          file: file,
          progress: progress
        });
      },
      (file, error) => {
        mainWindow.webContents.send('file-complete', {
          file: file,
          error: error
        });
      },
      (totalProgress) => {
        mainWindow.webContents.send('total-progress', totalProgress);
      },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
});

// Abrir carpeta de salida
ipcMain.handle('open-output-folder', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
