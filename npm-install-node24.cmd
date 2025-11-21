@echo off
call "C:\Users\rosemerecoutinho\Downloads\node24\nodevars.bat"

echo =======================================
echo Versão do Node utilizada:
node -v
echo Versão do NPM utilizada:
npm -v
echo =======================================

echo Rodando npm install no projeto atual...
npm install

echo =======================================
echo Processo concluído!
echo =======================================
pause
