// --- Mini DV Converter - Renderer Process ---

// --- 1. Sistema de Idiomas (Integrado para Máxima Robustez) ---
const translations = {
    gl: {
        title: 'Mini DV Converter',
        subtitle: 'Converte as túas cintas Mini DV a MP4 de alta calidade',
        dropZoneTitle: 'Arrastra arquivos aquí',
        dropZoneSubtitle: 'ou fai clic para seleccionar',
        selectFilesBtn: 'Seleccionar Arquivos',
        selectedFiles: 'Arquivos seleccionados',
        clearBtn: 'Limpar',
        outputLabel: 'Cartafol de saída:',
        outputPlaceholder: 'Selecciona o cartafol de saída...',
        selectOutputBtn: 'Seleccionar',
        totalProgress: 'Progreso Total',
        currentFile: 'Arquivo actual',
        startConversion: 'Iniciar Conversión',
        newConversion: 'Nova Conversión',
        openFolder: 'Abrir Cartafol de Saída',
        statusPending: 'Pendente',
        statusProcessing: 'Procesando...',
        statusCompleted: '✓ Completado',
        statusError: '✗ Erro',
        conversionComplete: '✓ Conversión completada! {count} arquivos procesados.',
        conversionError: 'Erro: {error}',
        footerText: 'FFmpeg integrado automaticamente • Conversión de alta calidade (CRF 18)'
    },
    es: {
        title: 'Mini DV Converter',
        subtitle: 'Convierte tus cintas Mini DV a MP4 de alta calidad',
        dropZoneTitle: 'Arrastra archivos aquí',
        dropZoneSubtitle: 'o haz clic para seleccionar',
        selectFilesBtn: 'Seleccionar Archivos',
        selectedFiles: 'Archivos seleccionados',
        clearBtn: 'Limpiar',
        outputLabel: 'Carpeta de salida:',
        outputPlaceholder: 'Selecciona la carpeta de salida...',
        selectOutputBtn: 'Seleccionar',
        totalProgress: 'Progreso Total',
        currentFile: 'Archivo actual',
        startConversion: 'Iniciar Conversión',
        newConversion: 'Nueva Conversión',
        openFolder: 'Abrir Carpeta de Salida',
        statusPending: 'Pendiente',
        statusProcessing: 'Procesando...',
        statusCompleted: '✓ Completado',
        statusError: '✗ Error',
        conversionComplete: '✓ Conversión completada! {count} archivos procesados.',
        conversionError: 'Error: {error}',
        footerText: 'FFmpeg integrado automáticamente • Conversión de alta calidad (CRF 18)'
    },
    en: {
        title: 'Mini DV Converter',
        subtitle: 'Convert your Mini DV tapes to high-quality MP4',
        dropZoneTitle: 'Drag files here',
        dropZoneSubtitle: 'or click to select',
        selectFilesBtn: 'Select Files',
        selectedFiles: 'Selected files',
        clearBtn: 'Clear',
        outputLabel: 'Output folder:',
        outputPlaceholder: 'Select output folder...',
        selectOutputBtn: 'Select',
        totalProgress: 'Total Progress',
        currentFile: 'Current file',
        startConversion: 'Start Conversion',
        newConversion: 'New Conversion',
        openFolder: 'Open Output Folder',
        statusPending: 'Pending',
        statusProcessing: 'Processing...',
        statusCompleted: '✓ Completed',
        statusError: '✗ Error',
        conversionComplete: '✓ Conversion completed! {count} files processed.',
        conversionError: 'Error: {error}',
        footerText: 'FFmpeg integrated automatically • High-quality conversion (CRF 18)'
    }
};

function getCurrentLanguage() {
    return localStorage.getItem('appLanguage') || 'gl';
}

function setLanguage(lang) {
    localStorage.setItem('appLanguage', lang);
    updateAllText();
}

function t(key, replacements = {}) {
    const lang = getCurrentLanguage();
    let text = translations[lang]?.[key] || translations['gl'][key] || key;
    Object.keys(replacements).forEach(r => {
        text = text.replace(`{${r}}`, replacements[r]);
    });
    return text;
}

// --- 2. Estado de la Aplicación ---
let selectedFiles = [];
let outputFolder = '';
let isConverting = false;

// --- 3. Elementos del DOM ---
const elements = {
    dropZone: document.getElementById('dropZone'),
    selectFilesBtn: document.getElementById('selectFilesBtn'),
    fileListSection: document.getElementById('fileListSection'),
    fileList: document.getElementById('fileList'),
    fileCount: document.getElementById('fileCount'),
    clearFilesBtn: document.getElementById('clearFilesBtn'),
    outputSection: document.getElementById('outputSection'),
    outputFolderInput: document.getElementById('outputFolder'),
    selectOutputBtn: document.getElementById('selectOutputBtn'),
    progressSection: document.getElementById('progressSection'),
    totalProgress: document.getElementById('totalProgress'),
    totalPercentage: document.getElementById('totalPercentage'),
    currentFileProgress: document.getElementById('currentFileProgress'),
    fileProgress: document.getElementById('fileProgress'),
    filePercentage: document.getElementById('filePercentage'),
    currentFileName: document.getElementById('currentFileName'),
    actionsSection: document.getElementById('actionsSection'),
    startBtn: document.getElementById('startBtn'),
    statusSection: document.getElementById('statusSection'),
    statusMessage: document.getElementById('statusMessage'),
    completionSection: document.getElementById('completionSection'),
    newConversionBtn: document.getElementById('newConversionBtn'),
    openFolderBtn: document.getElementById('openFolderBtn'),
    languageSelector: document.getElementById('languageSelector')
};

// --- 4. Inicialización de Eventos ---
function init() {
    if (!elements.languageSelector) return;

    // Configurar idioma inicial
    elements.languageSelector.value = getCurrentLanguage();

    // Selector de idioma
    elements.languageSelector.addEventListener('change', (e) => setLanguage(e.target.value));

    // Drag and drop
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('drag-over');
    });

    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('drag-over');
    });

    elements.dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files).map(f => f.path);
            addFiles(files);
        }
    });

    // Click en zona de drop
    elements.dropZone.addEventListener('click', async (e) => {
        if (e.target.closest('#selectFilesBtn')) return;
        const files = await window.electronAPI.selectFiles();
        if (files && files.length > 0) addFiles(files);
    });

    // Botón seleccionar archivos
    elements.selectFilesBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const files = await window.electronAPI.selectFiles();
        if (files && files.length > 0) addFiles(files);
    });

    // Limpiar lista
    elements.clearFilesBtn.addEventListener('click', () => {
        selectedFiles = [];
        updateFileList();
        hideProgress();
        hideStatus();
    });

    // Seleccionar carpeta de salida
    elements.selectOutputBtn.addEventListener('click', async () => {
        const folder = await window.electronAPI.selectOutputFolder();
        if (folder) {
            outputFolder = folder;
            elements.outputFolderInput.value = folder;
            updateUI();
        }
    });

    // Iniciar conversión
    elements.startBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0 || !outputFolder || isConverting) return;
        await startConversion();
    });

    // Nueva conversión (reset)
    elements.newConversionBtn.addEventListener('click', () => {
        resetApp();
        updateAllText();
    });

    // Abrir carpeta de salida
    elements.openFolderBtn.addEventListener('click', async () => {
        if (outputFolder) {
            await window.electronAPI.openOutputFolder(outputFolder);
        }
    });

    // Actualización Inicial
    updateAllText();
    updateUI();
}

// --- 5. Funciones de Interfaz ---

function updateAllText() {
    const textMapping = {
        'appTitle': 'title',
        'appSubtitle': 'subtitle',
        'dropZoneTitle': 'dropZoneTitle',
        'dropZoneSubtitle': 'dropZoneSubtitle',
        'selectFilesBtnText': 'selectFilesBtn',
        'selectedFilesTitle': 'selectedFiles',
        'clearFilesBtn': 'clearBtn',
        'outputLabel': 'outputLabel',
        'totalProgressLabel': 'totalProgress',
        'startBtnText': 'startConversion',
        'newConversionBtnText': 'newConversion',
        'openFolderBtnText': 'openFolder',
        'footerText': 'footerText'
    };

    for (const [id, key] of Object.entries(textMapping)) {
        const el = document.getElementById(id);
        if (el) el.textContent = t(key);
    }

    if (elements.outputFolderInput) elements.outputFolderInput.placeholder = t('outputPlaceholder');
    if (elements.selectOutputBtn) elements.selectOutputBtn.textContent = t('selectOutputBtn');

    if (!isConverting && elements.currentFileName) {
        elements.currentFileName.textContent = t('currentFile');
    }

    updateFileList();
}

function updateUI() {
    if (selectedFiles.length > 0 && outputFolder) {
        elements.actionsSection.style.display = 'block';
        elements.startBtn.disabled = isConverting;
    } else {
        elements.actionsSection.style.display = 'none';
        elements.outputSection.style.display = selectedFiles.length > 0 ? 'block' : 'none';
    }
}

function addFiles(filePaths) {
    const videoFiles = filePaths.filter(f =>
        f.toLowerCase().endsWith('.avi') || f.toLowerCase().endsWith('.dv')
    );

    videoFiles.forEach(filePath => {
        const exists = selectedFiles.some(f => f.path === filePath);
        if (!exists) {
            const fileName = filePath.split(/[\\\/]/).pop();
            const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

            selectedFiles.push({
                path: filePath,
                originalName: fileName,
                customName: nameWithoutExt,
                status: 'pending',
                isEditing: false
            });
        }
    });

    updateFileList();
    updateUI();
}

function updateFileList() {
    if (selectedFiles.length === 0) {
        elements.fileListSection.style.display = 'none';
        elements.outputSection.style.display = 'none';
        elements.actionsSection.style.display = 'none';
        return;
    }

    elements.fileListSection.style.display = 'block';
    elements.outputSection.style.display = 'block';
    elements.fileCount.textContent = selectedFiles.length;

    elements.fileList.innerHTML = selectedFiles.map((file, index) => {
        const statusText = getStatusText(file.status);
        const statusClass = file.status;

        let nameContent;
        if (file.isEditing) {
            nameContent = `
                <input type="text" class="file-name-input" value="${file.customName}" 
                       onkeydown="handleNameKey(event, ${index})" id="input-${index}">
                <button class="file-edit-btn save" onclick="saveName(${index})">✓</button>
                <button class="file-edit-btn cancel" onclick="cancelEdit(${index})">✕</button>
            `;
        } else {
            nameContent = `
                <span class="file-name-text" title="${file.path}">${file.customName}.mp4</span>
                ${file.status === 'pending' ? `<button class="file-edit-btn" onclick="editName(${index})">✎</button>` : ''}
            `;
        }

        return `
            <div class="file-item ${statusClass === 'completed' ? 'completed' : ''} ${statusClass === 'error' ? 'error' : ''}" data-index="${index}">
                <div class="file-name">
                    ${nameContent}
                </div>
                <div class="file-info">
                    <span class="file-status ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }).join('');

    const editingIndex = selectedFiles.findIndex(f => f.isEditing);
    if (editingIndex !== -1) {
        const input = document.getElementById(`input-${editingIndex}`);
        if (input) input.focus();
    }
}

// --- 6. Manejo de Conversión ---

async function startConversion() {
    isConverting = true;
    elements.startBtn.disabled = true;
    showProgress();
    hideStatus();
    hideCompletion();

    selectedFiles.forEach(file => { file.status = 'pending'; });
    updateFileList();

    try {
        const filesToConvert = selectedFiles.map(f => ({
            path: f.path,
            outputName: f.customName
        }));

        await window.electronAPI.convertBatch(filesToConvert, outputFolder);

        const successMsg = t('conversionComplete', { count: selectedFiles.length });
        showStatus(successMsg, false);
        showCompletion();
    } catch (error) {
        showStatus(t('conversionError', { error: error.message }), true);
    } finally {
        isConverting = false;
        elements.startBtn.disabled = false;
        elements.currentFileProgress.style.display = 'none';
        updateUI();
    }
}

// --- 7. Listeners de Progreso (IPC) ---

window.electronAPI.onBatchProgress((data) => {
    const fileName = data.file.split(/[\\\/]/).pop();
    updateFileProgress(fileName, data.progress);
    updateFileStatus(data.file, 'processing');
});

window.electronAPI.onTotalProgress((percent) => {
    elements.totalProgress.style.width = `${percent}%`;
    elements.totalPercentage.textContent = `${percent}%`;
});

window.electronAPI.onFileComplete((data) => {
    const status = data.error ? 'error' : 'completed';
    updateFileStatus(data.file, status);
});

// --- 8. Funciones Auxiliares ---

function getStatusText(status) {
    switch (status) {
        case 'pending': return t('statusPending');
        case 'processing': return t('statusProcessing');
        case 'completed': return t('statusCompleted');
        case 'error': return t('statusError');
        default: return status;
    }
}

function showProgress() {
    elements.progressSection.style.display = 'block';
    elements.totalProgress.style.width = '0%';
    elements.totalPercentage.textContent = '0%';
}

function hideProgress() {
    elements.progressSection.style.display = 'none';
    elements.currentFileProgress.style.display = 'none';
}

function updateFileProgress(fileName, percent) {
    elements.currentFileProgress.style.display = 'block';
    const file = selectedFiles.find(f => f.path.endsWith(fileName) || f.originalName === fileName);
    const displayName = file ? `${file.customName}.mp4` : fileName;
    elements.currentFileName.textContent = `${t('currentFile')}: ${displayName}`;
    elements.fileProgress.style.width = `${percent}%`;
    elements.filePercentage.textContent = `${percent}%`;
}

function updateFileStatus(filePath, status) {
    const index = selectedFiles.findIndex(f => f.path === filePath);
    if (index !== -1) {
        selectedFiles[index].status = status;
        updateFileList();
    }
}

function showStatus(message, isError = false) {
    elements.statusSection.style.display = 'block';
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = isError ? 'status-message error' : 'status-message';
}

function hideStatus() {
    elements.statusSection.style.display = 'none';
}

function showCompletion() { elements.completionSection.style.display = 'block'; }
function hideCompletion() { elements.completionSection.style.display = 'none'; }

function resetApp() {
    selectedFiles = [];
    outputFolder = '';
    elements.outputFolderInput.value = '';
    updateFileList();
    hideProgress();
    hideStatus();
    hideCompletion();
    updateUI();
}

// --- 9. Eventos Globales (Inline) ---
window.editName = (index) => {
    if (isConverting) return;
    selectedFiles[index].isEditing = true;
    updateFileList();
};

window.saveName = (index) => {
    const input = document.getElementById(`input-${index}`);
    if (input && input.value.trim()) {
        selectedFiles[index].customName = input.value.trim();
        selectedFiles[index].isEditing = false;
        updateFileList();
    }
};

window.cancelEdit = (index) => {
    selectedFiles[index].isEditing = false;
    updateFileList();
};

window.handleNameKey = (event, index) => {
    if (event.key === 'Enter') window.saveName(index);
    else if (event.key === 'Escape') window.cancelEdit(index);
};

// --- 10. Arranque ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
