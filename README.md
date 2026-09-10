
# City Digital Twin — Backend & Frontend Setup Guide

Run the backend and frontend with Docker Compose from the repository root,
using one root `.env` file for configuration.

---

## Prerequisites

- Docker with Docker Compose
- Git

Node.js and npm are only required for development outside Docker. The frontend
requires Node.js 20 or newer; its Docker build uses Node.js 22.

---

## Directory Structure

```
city-digital-twin/
├── .env
├── docker-compose.yml
├── backend/
└── frontend/
```

---

## Environment Variables (.env)

Copy `.env.example` to `.env` next to `docker-compose.yml` in the repository root
(`cp .env.example .env` on Linux/macOS, or `Copy-Item .env.example .env` in
PowerShell), then replace the example addresses:

```dotenv
ENDPOINT_URL=http://your-graphdb-host:7200/repositories/your-repository
REACT_APP_API_URL=http://localhost:3000
```

- `ENDPOINT_URL`: the GraphDB endpoint reachable from the backend container.
- `REACT_APP_API_URL`: the backend API URL reachable from the user's browser.
  For deployment to another machine, replace `localhost` with that server's
  hostname or IP address. Docker service names such as `backend` are not browser URLs.

Compose automatically loads the root `.env`. It passes `ENDPOINT_URL` to the
backend at runtime and `REACT_APP_API_URL` to the frontend at build time.
Neither `backend/.env` nor `frontend/.env` is required for this Compose workflow.
Both variables must be non-empty. Keep the root `.env` uncommitted; it is already
covered by `.gitignore`.

## Running with Docker Compose

From the repository root:

```bash
docker compose up -d --build
```

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000`

The frontend image runs `npm ci` and `npm run build` in a Node.js build stage.
Nginx serves the generated static files, with fallback to `index.html` for
client-side routes.

After changing either address in the root `.env`, run the same command again.
`REACT_APP_API_URL` is embedded in the frontend build, so restarting an existing
container alone does not apply changes to it. To rebuild only the frontend:

```bash
docker compose up -d --build --no-deps frontend
```

To stop both services:

```bash
docker compose down
```

---

## Running Backend and Frontend Locally

For development outside Docker, put `ENDPOINT_URL` in `backend/.env` and
`REACT_APP_API_URL` in `frontend/.env`. The root `.env` is loaded by Compose,
not by these local development commands.

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

## Local Development Behavior

- The backend server (API) will start on port `3000`.
- The frontend React development server will start on port `3001` or `3000` (depending on configuration).
- When you stop the frontend (CTRL+C), the backend server will also be stopped automatically.

---

## Notes

- Make sure to update the `.env` files with your actual API endpoints.
- This script is intended for development only — for production use Docker-based deployment.
- If you modify the backend code, `nodemon` will auto-restart the server.


## Next Steps

Optimize City Average Fetch functions
- In fetchFunctions.js there are two function I built to help calculate the city average walkability for each category called 'fetchCityAverage' and 'fetchCityAverageV2'. Both are quite slow, taking roughly an hour to return the request. fetchCityAverageV2 is a little slower because it tries to batch request to the walkability-score endpoint, but the database doesn't handle parallel request so this function is slow. fetchCityAverage is a little faster, and it makes one request to an endpoint on the server where the area instance ids are iterated over and a walkability query is executed for each one. It is only 1-2% faster.
- Aside from the optimizing to fetching functions themselves, it is worth considering developing an automated script to run daily and execute the fetch function, and then write the city average data to the knowledge graph. Then request from users using the interface will always get there request fulfilled much faster, and the data won't be stale.
- Currently, the fetchCityAverage function(s) are commented out from the 'Amenities.js' componenet, so no request for city average data is made. I suggest experimenting with copying the fetch logic to a script that can be automated to run and write/upsert its result to the knowledge graph. Then add a new endpoint to specifically read the inserted values from the knowledge graph which can then be cached, which will return a response much faster and be a better experience for users.

Catchment Areas
- A feature that wasn't implemented yet, catchment areas would involve selecting a individual building within a neighborhood and rendering a circle of a fixed radius around the coordinate, and showcasing walkability data of that building (such as how many amenity markers fall within the circle radius). We would need building level data in the knowledge graph for the feature for the purpose of highlighting a structure, but calculating the walkability in a fixed radius (ex 400m) from a coordinate on the map is something can be developed now but calculating the number of amenity markers that are within the boundary of the circle, and dividing that by the total number of amenities within the area instance border (organized by amenity category).

Icon Industry Standardization
- Investigate existing industry standards for icons/colors and evaluate if we meet them for the dashboard

