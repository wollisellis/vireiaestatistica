@echo off
echo Iniciando o servidor de desenvolvimento do BioEstat...
echo.

echo Verificando se as dependencias estao instaladas...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
    if errorlevel 1 (
        echo Erro ao instalar dependencias!
        pause
        exit /b 1
    )
)

echo.
echo Iniciando servidor na porta 3000...
echo Acesse: http://localhost:3000
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

npm run dev
