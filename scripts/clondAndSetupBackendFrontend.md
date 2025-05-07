# How to Use `setupBackendFrontend.sh`

## Overview

This script automates the setup process for the *City Digital Twin* project.  
It performs the following tasks:

1. Clone (or update) the project repository from GitHub.
2. Check out a specific Git branch.
3. Install frontend and backend dependencies using `npm`.
4. Create necessary `.env` environment variable files for both frontend and backend using pre-defined environment variables.
---

## Prerequisites

Ensure you have the following installed on your machine:

- Git
- Node.js & npm
- Internet connection (for cloning the repository and installing dependencies)

---

## Repository Information (from Script)

| Variable   | Description                         | Value |
|------------|-------------------------------------|-------|
| `REPO_URL` | GitHub repository URL              | `https://github.com/csse-uoft/city-digital-twin.git` |
| `REPO_DIR` | Local directory for the repository | `city-digital-twin` |
| `BRANCH`   | Git branch to checkout             | `main` |

---

## Environment Variables (from Script) (Update to correct address when set up on new machine)

| Variable              | Description                             | Value |
|----------------------|-----------------------------------------|-------|
| `REACT_APP_API_URL`  | Backend API endpoint                  | `http://206.12.97.46:23000` (IP Address of your backend)|
| `ENDPOINT_URL`       | Backend SPARQL database endpoint       | `http://ec2-3-97-59-180.ca-central-1.compute.amazonaws.com:7200/repositories/CACensus` |

These environment variables will be automatically written into `.env` files in both the `frontend/` and `backend/` directories if they do not already exist. 

---

## Usage

### 1. How to run the setup script

```bash
sudo bash setupBackendFrontend.sh
