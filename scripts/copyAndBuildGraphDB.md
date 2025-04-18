# How to Use `copyAndBuildGraphDB.sh`

## Overview
This script automates the process of:

1. Cloning GraphDB data from a remote EC2 instance.
2. Updating the `docker-compose.yml` file to use the cloned data.
3. Starting the GraphDB service using Docker Compose.

---

## Prerequisites

Ensure the following tools are installed on your local machine:

- Bash Shell
- SSH access to the remote EC2 instance
- `rsync`
- Docker & Docker Compose
- `sudo` permission for Docker commands

---

## Configuration

Update the following variables in `copyAndBuildGraphDB.sh` as needed:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `KEY_FILE` | SSH private key path | `./linxin_tove.pem` |
| `SSH_PORT` | SSH port | `22` |
| `REMOTE_USER` | EC2 username | `ec2-user` |
| `REMOTE_HOST` | EC2 public DNS | `ec2-3-97-59-180.ca-central-1.compute.amazonaws.com` |
| `REMOTE_FOLDER` | Remote GraphDB data path | `/root/graphdb-data` |
| `LOCAL_FOLDER` | Local path for GraphDB data | Dynamically set to `$(pwd)` (current working directory) |
| `DOCKER_COMPOSE_FILE` | Path to Docker Compose file | `./docker-compose.yml` |

---

## Usage

### 1. How to run

```bash
sudo bash copyAndBuildGraphDB.sh
