!/bin/bash

cd backend/

npm install

npx nodemon index.js &

BACKEND_PID=$! 

echo "Backend server started with PID: $BACKEND_PID"

cd ..

cd frontend/

npm install

npm run start

wait

kill $BACKEND_PID

cd ..