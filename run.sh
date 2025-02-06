#!/bin/bash
cd backend/

npm install

npx nodemon index.js &

cd ..

cd frontend/

npm install

npm run start

{
    "amenity": "http://ontology.eil.utoronto.ca/CDT#61698777University",
    "type": "http://ontology.eil.utoronto.ca/CDT#University",
    "amenityType": "University",
    "name": null,
    "coordinates": "LINESTRING (-79.388975 43.649409, -79.388628 43.649486, -79.3886 43.649421, -79.388633 43.649414, -79.388565 43.649253, -79.388879 43.649183, -79.388975 43.649409)"
}

{
    "amenity": "http://ontology.eil.utoronto.ca/CDT#132651811Park",
    "type": "http://ontology.eil.utoronto.ca/GCI/Recreation/GCIRecreation.owl#Park",
    "amenityType": "Park",
    "name": null,
    "coordinates": "POLYGON ((-79.369775 43.648396, -79.370753 43.648175, -79.370606 43.647834, -79.369628 43.648055, -79.369775 43.648396))"
}