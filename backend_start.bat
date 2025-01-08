@echo on
echo Starting the backend server...
cd backend
call npm install
start "Backend Server" cmd /k "call npx nodemon index.js"
echo Backend server started.

