@echo on
echo Starting frontend server setup...

:: Change to the frontend directory
cd frontend

:: Install frontend dependencies with error handling
call npm install || (
  echo "npm install failed. Exiting..."
  pause
  exit /b 1
)

echo "Dependencies installed successfully."

:: Set PORT and start the frontend server
start "Frontend Server" cmd /k "set PORT=3001 &&  call npm run dev-start"

echo Frontend server started on port 3001.
