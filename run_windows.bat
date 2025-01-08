@echo on
echo Running both backend and frontend scripts...

:: Run the backend start script
start "Running Backend" cmd /c "backend_start.bat"

:: Run the frontend start script
start "Running Frontend" cmd /c "frontend_start.bat"

