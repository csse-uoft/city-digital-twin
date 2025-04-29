#!/bin/bash

###############################################################################
# Script to build and run Docker containers for the City Digital Twin project.
# This script:
# - Stops and removes existing containers if they exist
# - Builds and runs the backend container on port 3000
# - Builds and runs the frontend container on port 3001
# Author: Linxin Li
# Date: April 4 2025
###############################################################################

# Stop and remove existing containers if they exist
docker stop city-digital-twin-backend city-digital-twin-frontend 2>/dev/null
docker rm city-digital-twin-backend city-digital-twin-frontend 2>/dev/null

# Change to the project root directory
cd city-digital-twin || { echo "Project directory 'city-digital-twin' not found! Exiting."; exit 1; }

###############################################################################
# BACKEND SETUP
###############################################################################

# Navigate to the backend directory
echo "Starting backend service on port 3000..."
cd backend || { echo "Backend directory not found! Exiting."; exit 1; }

# Build the Docker image for the backend
docker build -t city-digital-twin-backend .

# Run the backend container in detached mode, mapping port 3000
docker run -d --name city-digital-twin-backend -p 3000:3000 city-digital-twin-backend

# Return to the root project directory
cd ..

###############################################################################
# FRONTEND SETUP
###############################################################################

# Navigate to the frontend directory
echo "Starting frontend service on port 3001..."
cd frontend || { echo "Frontend directory not found! Exiting."; exit 1; }

# Build the Docker image for the frontend
docker build -t city-digital-twin-frontend .

# Run the frontend container in detached mode, mapping port 3001
docker run -d --name city-digital-twin-frontend -p 3001:3001 city-digital-twin-frontend

# Return to the root project directory
cd ..

###############################################################################
# SUMMARY
###############################################################################

echo "Backend is running on port 3000."
echo "Frontend is running on port 3001."
