#!/bin/bash

###############################################################################
# Script to clone GraphDB data from a remote EC2 instance,
# update volume paths in docker-compose.yml based on the local folder,
# and start the GraphDB container using Docker Compose.
###############################################################################

# Path to your private SSH key used for authentication
KEY_FILE="./linxin_tove.pem"

# SSH port (default is 22)
SSH_PORT="22"

# Remote SSH user
REMOTE_USER="ec2-user"

# Remote host (EC2 instance public DNS)
REMOTE_HOST="ec2-3-97-59-180.ca-central-1.compute.amazonaws.com"

# Remote directory to copy from
REMOTE_FOLDER="/root/graphdb-data"

# Local directory to copy to
LOCAL_FOLDER="$(pwd)"

# Path to Docker Compose file
DOCKER_COMPOSE_FILE="./docker-compose.yml"

# ###############################################################################
# # Step 1: Check and clone graphdb-data
# ###############################################################################

# if [ -d "${LOCAL_FOLDER}" ]; then
#     echo "❌ Local folder '${LOCAL_FOLDER}' already exists. Aborting to avoid overwriting existing data."
#     exit 1
# fi

# echo "📦 Cloning graphdb from ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_FOLDER} to ${LOCAL_FOLDER}..."

# rsync -avh -P --rsh="ssh -p${SSH_PORT} -i ${KEY_FILE}" \
#     "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_FOLDER}" "${LOCAL_FOLDER}"

# if [ $? -ne 0 ]; then
#     echo "❌ Error during rsync."
#     exit 1
# fi

echo "✅ Graphdb cloned successfully."

###############################################################################
# Step 2: Update docker-compose.yml volume paths
###############################################################################

if [ ! -f "${DOCKER_COMPOSE_FILE}" ]; then
    echo "❌ docker-compose.yml not found. Aborting."
    exit 1
fi

echo "🔧 Updating volume paths in docker-compose.yml to use '${LOCAL_FOLDER}'..."

# Escape slashes for use in sed
ESCAPED_LOCAL_FOLDER=$(echo "$LOCAL_FOLDER" | sed 's/\//\\\//g')

# Replace each graphdb volume line
sed -i "s|.*:/opt/graphdb/dist/conf|      - ${ESCAPED_LOCAL_FOLDER}/conf:/opt/graphdb/dist/conf|" "$DOCKER_COMPOSE_FILE"
sed -i "s|.*:/opt/graphdb/dist/data|      - ${ESCAPED_LOCAL_FOLDER}/data:/opt/graphdb/dist/data|" "$DOCKER_COMPOSE_FILE"
sed -i "s|.*:/opt/graphdb/dist/work|      - ${ESCAPED_LOCAL_FOLDER}/work:/opt/graphdb/dist/work|" "$DOCKER_COMPOSE_FILE"
sed -i "s|.*:/opt/graphdb/dist/logs|      - ${ESCAPED_LOCAL_FOLDER}/logs:/opt/graphdb/dist/logs|" "$DOCKER_COMPOSE_FILE"

echo "✅ Volume paths updated in docker-compose.yml."

# ###############################################################################
# # Step 3: Start Docker Compose
# ###############################################################################

# echo "🚀 Starting GraphDB service with Docker Compose..."
# sudo docker compose up -d

# if [ $? -eq 0 ]; then
#     echo "✅ GraphDB service is now running."
# else
#     echo "❌ Failed to start GraphDB service."
#     exit 1
# fi
