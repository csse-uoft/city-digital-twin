#!/bin/bash

#  As the name, it runs all dockers (Frontend, Backend, and Graph-DB)
echo "Starting frontend service on port 3001..."
docker run -d --name city-digital-twin-frontend -p 3001:3001 city-digital-twin-frontend

echo "Starting backend service on port 3000..."
docker run -d --name city-digital-twin-backend -p 3000:3000 city-digital-twin-backend

echo "Starting graphdb service on port"
sudo docker compose up -d
