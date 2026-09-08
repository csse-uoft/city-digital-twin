
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


## Next Steps

Optimize City Average Fetch functions
- In fetchFunctions.js there are two function I built to help calculate the city average walkability for each category called 'fetchCityAverage' and 'fetchCityAverageV2'. Both are quite slow, taking roughly an hour to return the request. fetchCityAverageV2 is a little slower because it tries to batch request to the walkability-score endpoint, but the database doesn't handle parallel request so this function is slow. fetchCityAverage is a little faster, and it makes one request to an endpoint on the server where the area instance ids are iterated over and a walkability query is executed for each one. It is only 1-2% faster.
- Aside from the optimizing to fetching functions themselves, it is worth considering developing an automated script to run daily and execute the fetch function, and then write the city average data to the knowledge graph. Then request from users using the interface will always get there request fulfilled much faster, and the data won't be stale.
- Currently, the fetchCityAverage function(s) are commented out from the 'Amenities.js' componenet, so no request for city average data is made. I suggest experimenting with copying the fetch logic to a script that can be automated to run and write/upsert its result to the knowledge graph. Then add a new endpoint to specifically read the inserted values from the knowledge graph which can then be cached, which will return a response much faster and be a better experience for users.

Catchment Areas
- A feature that wasn't implemented yet, catchment areas would involve selecting a individual building within a neighborhood and rendering a circle of a fixed radius around the coordinate, and showcasing walkability data of that building (such as how many amenity markers fall within the circle radius). We would need building level data in the knowledge graph for the feature for the purpose of highlighting a structure, but calculating the walkability in a fixed radius (ex 400m) from a coordinate on the map is something can be developed now but calculating the number of amenity markers that are within the boundary of the circle, and dividing that by the total number of amenities within the area instance border (organized by amenity category).

Icon Industry Standardization
- Investigate existing industry standards for icons/colors and evaluate if we meet them for the dashboard

