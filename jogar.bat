@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"

REM  Sobe a Secao 127 e abre no navegador.
REM
REM    jogar.bat          um turno sorteado
REM    jogar.bat demo     sempre o mesmo turno, para testar um caso duas vezes
REM
REM  O servidor fica numa janela propria: fechar aquela janela encerra o jogo.

set PORTA=5173
set SEMENTE=%1

if not exist node_modules (
  echo Primeira vez aqui: instalando as dependencias...
  call npm install
  if errorlevel 1 (
    echo.
    echo Nao consegui instalar as dependencias. O Node esta instalado?
    pause
    exit /b 1
  )
)

echo Subindo a Secao 127 em http://localhost:%PORTA%
start "Secao 127 - servidor" cmd /k npm run dev -- --port %PORTA% --strictPort

REM  Da um tempo para o Vite responder antes de abrir a pagina.
timeout /t 3 /nobreak >nul

if "%SEMENTE%"=="" (
  start "" http://localhost:%PORTA%/
) else (
  echo Turno fixo: %SEMENTE%
  start "" http://localhost:%PORTA%/?turno=%SEMENTE%
)

endlocal
