@echo off
setlocal enabledelayedexpansion

echo ============================================
echo USANDO NODE BINARY EM:
echo C:\Users\rosemerecoutinho\Downloads\node24
echo ============================================

set NODE_DIR=C:\Users\rosemerecoutinho\Downloads\node24

REM Força o terminal a usar esse Node
set PATH=%NODE_DIR%;%NODE_DIR%\npm;%NODE_DIR%\node_modules\npm\bin;%PATH%

echo.
echo Testando Node...
"%NODE_DIR%\node.exe" -v
if %errorlevel% neq 0 (
    echo ERRO: node.exe NAO FOI ENCONTRADO!
    echo Caminho atual: %NODE_DIR%
    echo Verifique se o arquivo node.exe existe nessa pasta.
    pause
    exit /b
)

echo.
echo Testando NPM...
"%NODE_DIR%\npm.cmd" -v
if %errorlevel% neq 0 (
    echo ERRO: npm.cmd NAO FOI ENCONTRADO!
    echo A versão binary do Node pode ter vindo SEM NPM.
    echo Solução: instale npm standalone ou baixe o node completo.
    pause
    exit /b
)

echo.
echo Rodando npm install...
"%NODE_DIR%\npm.cmd" install

echo.
echo ============================================
echo PROCESSO FINALIZADO!
echo ============================================
pause
