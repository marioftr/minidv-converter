# Mini DV Converter

Aplicación de escritorio para Windows que convierte archivos Mini DV (AVI) a MP4 de alta calidad.

## Características

- ✨ **Interfaz moderna y atractiva** con diseño glassmorphism
- 🎬 **Conversión de alta calidad** usando FFmpeg (CRF 18)
- 📦 **FFmpeg integrado** - descarga automática, sin instalación manual
- 🔄 **Procesamiento por lotes** - convierte múltiples archivos a la vez
- 📊 **Barras de progreso** - seguimiento en tiempo real
- 🖱️ **Drag & Drop** - arrastra archivos directamente a la aplicación
- ⚡ **Fácil de usar** - diseñado para usuarios no técnicos

## Requisitos

- Windows 10 o superior
- Node.js 16+ (solo para desarrollo)

## Instalación

### Para Usuarios

1. Descarga el instalador desde la sección de Releases
2. Ejecuta el instalador
3. ¡Listo! La aplicación está instalada y lista para usar

### Para Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/minidv-converter.git
cd minidv-converter

# Instalar dependencias
npm install

# Ejecutar la aplicación
npm start
```

## Uso

1. **Selecciona archivos**: Arrastra archivos AVI o DV a la zona de arrastre, o haz clic en "Seleccionar Archivos"
2. **Elige carpeta de salida**: Selecciona dónde quieres guardar los archivos MP4 convertidos
3. **Inicia conversión**: Haz clic en "Iniciar Conversión" y observa el progreso en tiempo real
4. **¡Listo!**: Los archivos MP4 estarán en la carpeta de salida seleccionada

## Configuración de FFmpeg

La aplicación utiliza los siguientes parámetros de FFmpeg optimizados específicamente para Mini DV:

```bash
ffmpeg -i "input.avi" -vf "yadif=1,setdar=16/9" -c:v libx264 -crf 18 -preset slow -profile:v high -level 4.1 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "output.mp4"
```

- **Deinterlacing**: yadif=1 (elimina el entrelazado del video Mini DV)
- **Aspect Ratio**: 16:9 (corrige la proporción de pantalla)
- **Video**: H.264 con CRF 18 (alta calidad), profile high, level 4.1
- **Pixel Format**: yuv420p (compatibilidad universal)
- **Audio**: AAC a 192 kbps
- **Preset**: slow (mejor compresión)
- **Faststart**: Optimización para reproducción web

## Desarrollo

### Scripts disponibles

- `npm start` - Inicia la aplicación en modo desarrollo
- `npm run dev` - Alias de npm start
- `npm run build` - Construye la aplicación para distribución

### Estructura del proyecto

```
minidv-converter/
├── main.js          # Proceso principal de Electron
├── preload.js       # Script de precarga para IPC seguro
├── renderer.js      # Lógica de la interfaz de usuario
├── converter.js     # Lógica de conversión con FFmpeg
├── index.html       # Estructura HTML
├── styles.css       # Estilos CSS
├── package.json     # Configuración del proyecto
└── README.md        # Este archivo
```

## Tecnologías

- **Electron** - Framework para aplicaciones de escritorio
- **FFmpeg** - Motor de conversión de video
- **fluent-ffmpeg** - Wrapper de Node.js para FFmpeg
- **@ffmpeg-installer/ffmpeg** - Instalador automático de FFmpeg

## Licencia

MIT

## Autor

Mario
