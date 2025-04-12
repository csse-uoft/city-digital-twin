#!/bin/bash

###############################################################################
# Script to clone (or update) the City Digital Twin repository,
# check out a specific branch, install frontend and backend dependencies,
# and set up necessary environment variable files (.env).
#
# Author: Linxin Li
# Date: April 04, 2025
###############################################################################

# Repository information
REPO_URL="https://github.com/csse-uoft/city-digital-twin.git"   # Git repo URL
REPO_DIR="city-digital-twin"                                    # Local folder name
BRANCH="develop_disable_select"                                 # Git branch to checkout

###############################################################################
# Clone or update the repository
###############################################################################

# If the repo directory already exists, pull the latest changes
if [ -d "$REPO_DIR" ]; then
  echo "Repository already exists. Pulling the latest changes..."
  cd "$REPO_DIR" || exit
  git pull origin "$BRANCH"
else
  # If not, clone the repo and check out the desired branch
  echo "Cloning repository from GitHub..."
  git clone "$REPO_URL"
  cd "$REPO_DIR" || exit
  git checkout "$BRANCH"
fi

###############################################################################
# Setup: Frontend
###############################################################################

cd frontend || exit

# Install frontend dependencies using npm
echo "Installing frontend dependencies..."
npm install

# Create frontend .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file for frontend..."
  echo "REACT_APP_API_URL=http://206.12.97.46:23000" > .env
  echo "Created .env file in frontend"
fi

###############################################################################
# Setup: Backend
###############################################################################

cd ../backend || exit

# Install backend dependencies using npm
echo "Installing backend dependencies..."
npm install

# Create backend .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file for backend..."
  echo "ENDPOINT_URL=http://ec2-3-97-59-180.ca-central-1.compute.amazonaws.com:7200/repositories/CACensus" > .env
  echo "Created .env file in backend"
fi

###############################################################################
# Completion message
###############################################################################

echo "Setup complete! Next step: create and run Docker containers."
