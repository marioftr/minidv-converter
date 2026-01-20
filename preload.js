const { contextBridge, ipcRenderer } = require('electron');

// Exponer API segura al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Seleccionar archivos
    selectFiles: () => ipcRenderer.invoke('select-files'),

    // Seleccionar carpeta de salida
    selectOutputFolder: () => ipcRenderer.invoke('select-output-folder'),

    // Convertir un solo archivo
    convertFile: (inputPath, outputPath) =>
        ipcRenderer.invoke('convert-file', inputPath, outputPath),

    // Convertir múltiples archivos
    convertBatch: (files, outputFolder) =>
        ipcRenderer.invoke('convert-batch', files, outputFolder),

    // Listeners para eventos de progreso
    onConversionProgress: (callback) => {
        ipcRenderer.on('conversion-progress', (event, data) => callback(data));
    },

    onBatchProgress: (callback) => {
        ipcRenderer.on('batch-progress', (event, data) => callback(data));
    },

    onFileComplete: (callback) => {
        ipcRenderer.on('file-complete', (event, data) => callback(data));
    },

    onTotalProgress: (callback) => {
        ipcRenderer.on('total-progress', (event, progress) => callback(progress));
    },

    // Abrir carpeta de salida
    openOutputFolder: (folderPath) =>
        ipcRenderer.invoke('open-output-folder', folderPath)
});
