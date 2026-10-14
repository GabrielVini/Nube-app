@echo off
setlocal
title Nobe Estagios - Inicializador
cd /d "%~dp0"

echo ========================================
echo        NOBE ESTAGIOS - INICIADOR
echo ========================================
echo.

where node >nul 2>nul || goto :node_error
where npm >nul 2>nul || goto :node_error

set "PYTHON_CMD=python"
where python >nul 2>nul || set "PYTHON_CMD=py"
where %PYTHON_CMD% >nul 2>nul || goto :python_error

if not exist "node_modules\" (
  echo [1/4] Instalando dependencias do Angular...
  call npm install
  if errorlevel 1 goto :install_error
) else (
  echo [1/4] Dependencias do Angular encontradas.
)

if not exist "backend\.venv\Scripts\python.exe" (
  echo [2/4] Criando ambiente virtual do backend...
  %PYTHON_CMD% -m venv "backend\.venv"
  if errorlevel 1 goto :install_error
  echo Instalando dependencias do backend...
  "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
  if errorlevel 1 goto :install_error
) else (
  echo [2/4] Ambiente do backend encontrado.
)

echo [3/4] Preparando banco de dados...
if not exist "backend\data\" mkdir "backend\data"
pushd "backend"
".venv\Scripts\python.exe" -m alembic upgrade head
if errorlevel 1 (
  popd
  goto :database_error
)
popd

echo [4/4] Abrindo os servidores...
start "Nobe Backend" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8001"
timeout /t 3 /nobreak >nul
start "Nobe Angular" cmd /k "cd /d ""%~dp0"" && npm start"

echo.
echo Servidores iniciados.
echo Aguarde o Angular terminar e abra:
echo http://127.0.0.1:4200
echo.
pause
exit /b 0

:node_error
echo ERRO: Node.js ou npm nao foi encontrado.
echo Instale o Node.js e tente novamente.
pause
exit /b 1

:python_error
echo ERRO: Python nao foi encontrado.
echo Instale o Python e marque a opcao para adiciona-lo ao PATH.
pause
exit /b 1

:install_error
echo.
echo ERRO: Nao foi possivel instalar as dependencias.
echo Verifique a conexao com a internet e tente novamente.
pause
exit /b 1

:database_error
echo.
echo ERRO: Nao foi possivel preparar o banco de dados.
pause
exit /b 1
