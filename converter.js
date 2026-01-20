const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const path = require('path');
const fs = require('fs');

// Configurar ruta de ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Convierte un archivo Mini DV a MP4
 * @param {string} inputPath - Ruta del archivo de entrada
 * @param {string} outputPath - Ruta del archivo de salida
 * @param {function} onProgress - Callback para progreso (recibe porcentaje)
 * @param {function} onComplete - Callback al completar (recibe error si hay)
 */
function convertFile(inputPath, outputPath, onProgress, onComplete) {
    // Verificar que el archivo de entrada existe
    if (!fs.existsSync(inputPath)) {
        onComplete(new Error('El archivo de entrada no existe'));
        return;
    }

    // Crear directorio de salida si no existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(inputPath)
        .videoFilters([
            'yadif=1',          // Deinterlace - esencial para Mini DV entrelazado
            'setdar=16/9'       // Corregir aspect ratio a 16:9
        ])
        .videoCodec('libx264')
        .outputOptions([
            '-preset slow',
            '-crf 18',
            '-profile:v high',
            '-level 4.1',
            '-pix_fmt yuv420p',
            '-movflags +faststart'  // Optimización para streaming/web
        ])
        .audioCodec('aac')
        .audioBitrate('192k')
        .output(outputPath)
        .on('start', (commandLine) => {
            console.log('FFmpeg iniciado:', commandLine);
        })
        .on('progress', (progress) => {
            // El progreso viene como porcentaje
            const percent = progress.percent || 0;
            console.log(`Procesando: ${Math.round(percent)}%`);
            if (onProgress) {
                onProgress(Math.round(percent));
            }
        })
        .on('end', () => {
            console.log('Conversión completada:', outputPath);
            if (onComplete) {
                onComplete(null);
            }
        })
        .on('error', (err) => {
            console.error('Error en la conversión:', err.message);
            if (onComplete) {
                onComplete(err);
            }
        })
        .run();
}

/**
 * Convierte múltiples archivos en lote
 * @param {Array<string>} files - Array de rutas de archivos de entrada
 * @param {string} outputFolder - Carpeta de salida
 * @param {function} onFileProgress - Callback para progreso por archivo
 * @param {function} onFileComplete - Callback al completar cada archivo
 * @param {function} onTotalProgress - Callback para progreso total
 * @param {function} onComplete - Callback al completar todo el batch
 */
function convertBatch(files, outputFolder, onFileProgress, onFileComplete, onTotalProgress, onComplete) {
    let completedFiles = 0;
    let hasError = false;

    // Crear carpeta de salida si no existe
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }

    function processNextFile(index) {
        if (index >= files.length) {
            // Todos los archivos procesados
            if (onComplete) {
                onComplete(hasError ? new Error('Algunos archivos tuvieron errores') : null);
            }
            return;
        }

        const fileData = files[index];
        const inputPath = typeof fileData === 'string' ? fileData : fileData.path;
        const customName = typeof fileData === 'string'
            ? path.basename(inputPath, path.extname(inputPath))
            : fileData.outputName;

        const outputPath = path.join(outputFolder, `${customName}.mp4`);

        console.log(`\nProcesando archivo ${index + 1}/${files.length}: ${customName}`);

        convertFile(
            inputPath,
            outputPath,
            (progress) => {
                // Progreso del archivo actual
                if (onFileProgress) {
                    onFileProgress(inputPath, progress);
                }

                // Calcular progreso total
                const fileWeight = 100 / files.length;
                const totalProgress = (completedFiles * fileWeight) + (progress * fileWeight / 100);

                if (onTotalProgress) {
                    onTotalProgress(Math.round(totalProgress));
                }
            },
            (error) => {
                if (error) {
                    console.error(`Error al procesar ${customName}:`, error.message);
                    hasError = true;
                } else {
                    console.log(`✓ Completado: ${customName}`);
                }

                completedFiles++;

                // Notificar que este archivo se completó
                if (onFileComplete) {
                    onFileComplete(inputPath, error);
                }

                // Procesar siguiente archivo
                processNextFile(index + 1);
            }
        );
    }

    // Iniciar procesamiento
    processNextFile(0);
}

module.exports = {
    convertFile,
    convertBatch
};
