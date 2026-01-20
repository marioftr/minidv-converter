@echo off
setlocal enabledelayedexpansion

:: ==========================================================
:: CONVERSOR MINI DV A MP4 - VERSIÓN LEGACY (Windows XP)
:: ==========================================================
:: Instrucciones: Solo tienes que arrastrar tus archivos .avi
:: o una carpeta llena de ellos encima de este icono.
:: ==========================================================

title Conversor Mini DV - Windows XP Mode

:: 1. Verificar si FFmpeg existe en la carpeta o en el PATH
set FFMPEG_BIN=ffmpeg.exe
%FFMPEG_BIN% -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No se encuentra ffmpeg.exe
    echo Por favor, copia ffmpeg.exe a esta misma carpeta.
    echo Mira el archivo INSTRUCCIONES_XP.txt para saber de donde bajarlo.
    pause
    exit /b
)

:: 2. Crear carpeta de salida si no existe
if not exist "convertidos" mkdir "convertidos"

echo.
echo ==========================================================
echo   INICIANDO CONVERSION DE CINTAS MINI DV
echo ==========================================================
echo.

:: 3. Procesar archivos arrastrados
if "%~1"=="" (
    echo [!] No has arrastrado ningun archivo.
    echo Arrastra archivos .avi o una carpeta sobre este script.
    pause
    exit /b
)

:process
if "%~1"=="" goto end

:: Si es una carpeta, procesar todos los AVI dentro
if exist "%~1\" (
    echo [+] Procesando carpeta: %~1
    for %%f in ("%~1\*.avi") do (
        call :convert "%%f"
    )
) else (
    :: Si es un archivo individual
    call :convert "%~1"
)

shift
goto process

:convert
set "input=%~1"
set "filename=%~n1"
set "output=convertidos\!filename!.mp4"

if /I not "%~x1"==".avi" (
    echo [!] Saltando %~nx1 (No es un archivo AVI)
    goto :eof
)

echo.
echo [+] Procesando: %~nx1
echo ----------------------------------------------------------

:: COMANDO FFMEG (Configuracion identica a la App de escritorio)
:: -yadif=1 : Desentrelazado
:: -setdar=16/9 : Forzar aspecto 16:9
:: -crf 18 : Alta calidad
:: -preset slow : Mejor compresion
:: -pix_fmt yuv420p : Compatibilidad universal

"%FFMPEG_BIN%" -i "%input%" ^
    -vf "yadif=1,setdar=16/9" ^
    -c:v libx264 -preset slow -crf 18 -profile:v high -level 4.1 -pix_fmt yuv420p ^
    -c:a aac -b:a 192k -movflags +faststart ^
    -y "%output%"

if %errorlevel% equ 0 (
    echo.
    echo [OK] Completado: !output!
) else (
    echo.
    echo [ERROR] Fallo al convertir: %~nx1
)
echo ----------------------------------------------------------
goto :eof

:end
echo.
echo ==========================================================
echo   PROCESO FINALIZADO
echo   Los archivos estan en la carpeta "convertidos"
echo ==========================================================
pause
