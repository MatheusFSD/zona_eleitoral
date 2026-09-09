@echo off
rem Gera o zip para subir no itch.io: o jogo construido, com index.html na raiz.
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias...
  call npm install || goto :erro
)

echo Construindo o jogo...
call npm run build || goto :erro

echo Empacotando...
call node empacotar.mjs || goto :erro

echo.
echo No itch.io: crie um projeto com Kind of project = HTML, suba o zip,
echo marque "This file will be played in the browser" e use viewport 1280 x 800.
echo.
pause
exit /b 0

:erro
echo.
echo Falhou. Veja a mensagem acima.
pause
exit /b 1
