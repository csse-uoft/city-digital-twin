# How to Use `buildAndRunDockerFrontBack.sh`

## Overview

This script automates the process of building and running Docker containers for the *City Digital Twin* project.  
It will:

1. Stop and remove existing backend and frontend containers (if they exist).
2. Build the backend Docker image and run the container on port `3000`.
3. Build the frontend Docker image and run the container on port `3001`.


---

## Prerequisites

Ensure you have:

- run `setupBackendFrontend.sh` to clone the code from github.
- Docker installed and running.
- The project directory structure as follows:

## Usage

### 1. How to run

```bash
sudo bash buildAndRunDockerFrontBack.sh
