
# City Digital Twin — Backend & Frontend Setup Guide

This guide explains how to set up and run the backend and frontend services for the City Digital Twin project in a local development environment.

---

## Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher recommended)
- npm (Node Package Manager)
- Git

---

## Directory Structure

```
city-digital-twin/
├── backend/
│   ├── .env
│   └── (source code)
└── frontend/
    ├── .env
    └── (source code)
```

---

## Environment Variables (.env)

Before running the project, you need to create `.env` files for both `backend` and `frontend`.

### Backend `.env` example:

Create `backend/.env`:

```
ENDPOINT_URL=http://your-graphdb-endpoint-url
```

Replace `http://your-graphdb-endpoint-url` with your actual GraphDB endpoint.

---

### Frontend `.env` example:

Create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:3000
```

This tells the frontend where to send API requests. (It should points to the backend address)

---

## Running Backend and Frontend Locally

You can use the provided script to automatically install dependencies and start both services.

### Using a Script

On Windows: Run the `run_windowns.bat` script.

On Mac: Run the `run_shell` script.

### To Run Manually:

Step to run backend (run backend first)


```bash
cd backend/

npm install

npx nodemon index.js &

```

Step to run frontend

```bash
cd frontend

npm install

npm run dev-start
```
---

## Expected Behavior

- The backend server (API) will start on port `3000`.
- The frontend React development server will start on port `3001` or `3000` (depending on configuration).
- When you stop the frontend (CTRL+C), the backend server will also be stopped automatically.

---

## Notes

- Make sure to update the `.env` files with your actual API endpoints.
- This script is intended for development only — for production use Docker-based deployment.
- If you modify the backend code, `nodemon` will auto-restart the server.
