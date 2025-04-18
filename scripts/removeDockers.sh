#!/bin/bash

# Removing Dockers: backend & frontend

echo "Removing Dockers: backend & frontend"
docker rm city-digital-twin-backend city-digital-twin-frontend 
echo "Backend & Frontend Removed."
