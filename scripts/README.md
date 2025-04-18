# City Digital Twin - Full Deployment Guide

This guide walks you through the step-by-step process of setting up and running the **GraphDB**, **Backend**, and **Frontend** services using the provided automation scripts.

---

## 📁 Step 1: Clone and Set Up Frontend & Backend Codebase

```bash
sudo bash cloneAndSetupBackendFrontend.sh
```

This will:
- Clone or update the repository
- Use the `develop` branch (you can change the branch name inside the script)
- Install frontend/backend dependencies via `npm install`
- Create `.env` files for frontend and backend

---

## 🧠 Step 2: Clone and Configure GraphDB 

If GraphDB data needs to be cloned from an existing EC2 instance:

```bash
sudo bash copyAndBuildGraphDB.sh
```

This will:
- Pull data from a remote EC2 instance
- Update `docker-compose.yml` to reflect correct local volume paths
- Start the GraphDB container

> ⚠️ Ensure `docker-compose.yml` is in the same directory as the `graphdb-data` folder and has correct volume mappings:

```yaml
volumes:
  - /mnt/graphdb-data/conf:/opt/graphdb/dist/conf
  - /mnt/graphdb-data/data:/opt/graphdb/dist/data
  - /mnt/graphdb-data/work:/opt/graphdb/dist/work
  - /mnt/graphdb-data/logs:/opt/graphdb/dist/logs
```

---

## 🧱 Step 3: Build and Run Backend & Frontend in Docker

```bash
sudo bash buildAndRunDockerFrontBack.sh
```

This will:
- Build and run the backend on port `3000`
- Build and run the frontend on port `3001`

---

## 🚀 Alternative: Run All Docker Containers at Once (Can only run afte Step 3)

To run all services (Frontend, Backend, and GraphDB) with one script:

```bash
sudo bash runAllDockers.sh
```

This will:
- Run the frontend container on port `3001`
- Run the backend container on port `3000`
- Use `docker compose` to start GraphDB

---

## 🕒 Optional: Stop All Services After Delay

```bash
sudo bash stopDockerAll.sh <SECONDS>
```

This script:
- Waits for `<SECONDS>` before stopping all three containers
- If no argument is given, stops immediately

Example:
```bash
sudo bash stopDockerAll.sh 60
```

---

## 🧹 Optional: Remove Backend & Frontend Containers Only

```bash
sudo bash removeDockers.sh
```

This will:
- Remove only the backend and frontend containers

---


## ✅ Final Notes
- Check docker and docker-compose is install and up-to-date. Tested working verison: `Docker version 28.0.1, build 068a01e` and `Docker Compose version v2.24.2`
- Ensure Docker and Docker Compose are installed and running.
- GraphDB is optional if you're only testing frontend/backend.
- `.env` files are auto-generated with correct API and database URLs.