@echo off

:: Change to the 'backend' directory
cd backend

:: Install backend dependencies using npm
npm install

:: Run the backend server using nodemon
npx nodemon index.js

:: Change back to the original directory
cd ..

:: Change to the 'frontend' directory
cd frontend

:: Install frontend dependencies using npm
npm install

:: Start the frontend development server
npm run start

:: Return to the original directory
cd ..