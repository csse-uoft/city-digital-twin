#!/bin/bash

# As the name suggests, this script runs all dockers (Frontend, Backend, and Graph-DB)

# Function to start or resume a container
start_or_resume_container() {
    local name=$1
    local port_mapping=$2
    local image=$3

    # Check if the container exists
    if [ "$(docker ps -aq -f name=^/${name}$)" ]; then
        # If it's not running, start it
        if [ "$(docker ps -q -f name=^/${name}$)" ]; then
            echo "$name is already running."
        else
            echo "Resuming existing container $name..."
            docker start $name
        fi
    else
        echo "Creating and starting new container $name..."
        docker run -d --name $name -p $port_mapping $image
    fi
}

echo "Handling frontend service on port 3001..."
start_or_resume_container city-digital-twin-frontend 3001:3001 city-digital-twin-frontend

echo "Handling backend service on port 3000..."
start_or_resume_container city-digital-twin-backend 3000:3000 city-digital-twin-backend

echo "Starting graphdb service using docker-compose..."
sudo docker compose up -d
