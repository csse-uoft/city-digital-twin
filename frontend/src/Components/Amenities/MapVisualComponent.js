import { useState, useEffect, useReducer } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Popup, Polygon, Tooltip, TileLayer, MapContainer, Marker } from "react-leaflet";
import { Input, Button, Select, Autocomplete, Option } from '@mui/joy';
import { customAmenityMarker } from '../../helpers/utils'

import Legend from './Legend';
import FilterPanel from './FilterPanel'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const MapVisualComponent = ({
    locationIDPolygons,
    amenities,
    instanceName,
    overlayCoords,
    locationIDKey
}) => {

    const [filterPanelOpen, setFilterPanelOpen] = useState(false)

    // const baseURI = "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
    // const fullKey = baseURI + locationIDKey;
    // const locationID = amenityPolygons[locationIDKey];
    // let overlayCoords = locationIDPolygons[fullKey]?.coordinates;
    const worldBounds = [
    [-90, -180],
    [90, -180],
    [90, 180],
    [-90, 180],
    ];

    return(
        <Box sx={{width:"100%"}}>
            <Stack>
                <Box sx={{width:"100%", px:1, display:"flex", py:1, boxSizing:"border-box", height: "50px",borderBottom:"1px solid", backgroundColor:"white", alignItems:"center", justifyContent:"flex-start", gap:2}}>
                    <Button size="sm" variant="outlined" color="neutral" startDecorator={<FilterAltOutlinedIcon />} onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
                        Filter
                    </Button>

                    <Button size="sm" variant="outlined" color="neutral" startDecorator={<CircleOutlinedIcon />}>
                        Catchment Area
                    </Button>
                </Box>

                <Box sx={{ width: "100%", height: "calc(100dvh - 99px)", position:'relative' }}>
                    <MapContainer
                        center={[43.7, -79.42]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                        {/*Instance boundary*/}
                        
                              <Polygon positions={[worldBounds,overlayCoords]}
                              pathOptions={{
                                fillOpacity: 0.3,
                                color: '#414141',
                                fillColor:'black'
                              }}>
                                <Popup>{`Overlay for ${instanceName}`}</Popup>
                              </Polygon>

                              <Marker icon={customAmenityMarker('Health')} position={[43,-79]}></Marker>
                              <Marker icon={customAmenityMarker('Spiritual')} position={[44,-78]}></Marker>
                              {Object.entries(amenities)?.map(
                              ([amenityName, amenityObj]) => {
                                if (amenityObj.displayType === "Point") {
                                  return (
                                    <Marker
                                        icon={customAmenityMarker(amenityName)}
                                        key={amenityName}
                                        position={[
                                            amenityObj.coordinates[0],
                                            amenityObj.coordinates[1],
                                        ]}
                                    >
                                      <Popup>{amenityName}</Popup>
                                    </Marker>
                                  );
                                }
                            })}
                            {/* <Marker
                            icon={customAmenityMarker('Health')}
                            position={[43,-79]}></Marker> */}
                        


                    


                    </MapContainer>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: '20px',
                            right: '20px',
                            zIndex: 900,
                            width: '300px',
                            maxWidth: '90%',
                        }}
                    >
                        <Legend />
                    </Box>

                    <Box
                    sx={{position:"absolute",
                        top:'6px',
                        left:'50px',
                        zIndex: 999,
                        maxWidth:'100%',
                        width:'400px'
                    }}>
                        <FilterPanel isOpen={filterPanelOpen} />
                    </Box>
                </Box>

            </Stack>
            
        </Box>
    )
}

export default MapVisualComponent