# Guia de Conversion Mini DV en Windows XP

Esta version "Legacy" esta diseñada para funcionar en ordenadores antiguos que no pueden ejecutar la aplicacion moderna.

## 1. Instalación de FFmpeg para Windows XP

FFmpeg moderno ya no funciona en XP. He verificado que esta versión es la más compatible:

1. **Descarga Directa**: [Haz clic aquí para bajar FFmpeg 4.2.2 (32-bit Legacy)](https://www.videohelp.com/download/ffmpeg-4.2.2-win32-static.zip)
   * *Si la web de GitHub no te carga bien en XP, esta web suele ser más ligera.*
2. Una vez descargado el ZIP, ábrelo y entra en la carpeta `bin`.
3. **Copia el archivo `ffmpeg.exe`** y pégalo aquí mismo, en la carpeta `legacy/`.

## 2. Como usar el conversor

El uso es muy sencillo mediante "Arrastrar y Soltar":

1. Abre la carpeta `legacy/` en tu Windows XP.
2. Selecciona tus archivos `.avi` (los que capturaste de la cinta).
3. **Arrastra** esos archivos directamente encima del icono del archivo `convertir_xp.bat`.
4. Se abrira una ventana negra de comandos y empezara la conversion.
5. Los archivos resultantes (en formato MP4 de alta calidad) apareceran en una nueva carpeta llamada `convertidos`.

## 3. Calidad de imagen

Este script utiliza los mismos parametros que la aplicacion principal:
- **Desentrelazado (YADIF):** Elimina las rayas horizontales tipicas de las cintas antiguas.
- **Formato 16:9:** Estira la imagen para que se vea correctamente en pantallas modernas.
- **Alta Calidad (CRF 18):** Mantiene casi toda la calidad original pero en un archivo mucho mas pequeño.

---
*Nota: La conversion en un PC antiguo puede ser lenta. Ten paciencia, los resultados valen la pena.*
