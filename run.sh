#!/bin/bash
cd backend/

npm install

npx nodemon index.js &

cd ..

cd frontend/

npm install

npm run start