import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";

// indicatorData
// [{name:NAME, data:DATA, coord:COORDS}]
function MapView({mapPolygons, indicator}) {
  return (
    <MapContainer
      style={{ minHeight: '100%'}}
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
  );
}

export default MapView;