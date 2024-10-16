import { Box } from "@mui/joy";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

// indicatorData
// [{name:NAME, data:DATA, coord:COORDS}]
function MapView({mapPolygons, indicator}) {
  return (
    // <div style={{ maxHeight: '400px'}}>

    <Box sx={{ maxHeight: '700px', maxWidth: '500px', alignItems: 'center'}}>
      <MapContainer
        style={{ maxHeight:'700px', maxWidth: '500px' }}
        className="map"
        center={[43.651070, -79.347015]}
        zoom={10}
        minZoom={3}
        maxZoom={19}
        maxBounds={[[-85.06, -180], [85.06, 180]]}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution=' &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapPolygons[indicator].polygons}
    </MapContainer>
    </Box>
  );
}

export default MapView;