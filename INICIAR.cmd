@echo off
setlocal
cd /d "%~dp0"
echo Ta Marcado - teste local
echo Abra http://127.0.0.1:4173/ no navegador.
echo Mantenha esta janela aberta durante o teste. Ctrl+C encerra.
where node >nul 2>nul
if not errorlevel 1 (
  node server.mjs
) else if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
  "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.mjs
) else (
  echo Node.js 22.13 ou superior nao encontrado. Instale o Node.js para executar.
)
pause
