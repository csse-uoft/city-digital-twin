import { useState, useEffect, useReducer } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Popup, Polygon, Tooltip, TileLayer, MapContainer, Marker } from "react-leaflet";
import { Input, Button, Select, Autocomplete, Option } from '@mui/joy';
import { customAmenityMarker } from '../../helpers/utils'
import { fetchAreaAmenities } from '../../helpers/fetchFunctions'

import Legend from './Legend';
import FilterPanel from './FilterPanel'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

import L from "leaflet";
import "leaflet/dist/leaflet.css";


function initializeFilterState (amenities) {
    let state = {}
    Object.entries(amenities).map(([name,data]) => {
        data?.subtypes?.map((subtype) => {
            state[subtype] = {
                type: name,
                show:true
            }
        })
    })
    console.log('amenity filter state: ',state)
    return state
}   

const MapVisualComponent = ({
    locationIDPolygons,
    instanceName,
    instanceURL,
    overlayCoords,
    locationIDKey,
    cityState
}) => {

    const [filterPanelOpen, setFilterPanelOpen] = useState(false)
    console.log('map visual comp city state: ', cityState)
    console.log('OVERLAY COORDS: ',overlayCoords)
    const [filterPanelState, setFilterPanelState] = useState(initializeFilterState(cityState.amenityCategories))
    const [amenities, setAmenities] = useState([])
    const [loadingAmenities, setLoadingAmenities] = useState(false)

    useEffect(() => {
        const getAreaAmenities = async () => {
            try {
                setLoadingAmenities(true)
                const amenities = await fetchAreaAmenities(instanceURL,cityState.cityURI)
                console.log('MVC amenities: ', amenities)
                setAmenities(amenities)
            } catch (err) {
                console.error('ERR loading area amenities: ',err)
            } finally {
                setLoadingAmenities(false)
            }
            
        }

        getAreaAmenities()
    },[])

    const updateFilters = (type, filter) => {
        // Create a shallow copy of the state
        const newState = { ...filterPanelState };

        if (filter === 'all') {
            // Toggle all subtypes belonging to this category
            Object.keys(newState).forEach(key => {
                if (newState[key].type === type) {
                    newState[key] = { ...newState[key], show: true };
                }
            });
        } else {
            // Guard against missing key before accessing .show
            if (newState[filter] === undefined) {
                console.warn(`Filter key "${filter}" not found in filterPanelState`);
                return;
            }
            newState[filter] = { ...newState[filter], show: !newState[filter].show };
        }

        setFilterPanelState(newState);
    }

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
        <Box sx={{width:"100%", marginTop: {xs: "40px", md:"0px"}}}>
            <Stack>
                <Box sx={{width:"100%", px:1, display:"flex", py:1, boxSizing:"border-box", height: "50px",borderBottom:"1px solid var(--border-color)", backgroundColor:"white", alignItems:"center", justifyContent:"flex-start", gap:2}}>
                    <Button size="sm" variant="outlined" color="neutral" startDecorator={<FilterAltOutlinedIcon />} onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
                        Filter
                    </Button>

                    <Button size="sm" variant="outlined" color="neutral" startDecorator={<CircleOutlinedIcon />}>
                        Catchment Area
                    </Button>

                    {loadingAmenities && <Typography variant="h4" style={{fontSize:14, color: 'var(--text-medium)'}}>Loading Amenities...</Typography>}
                </Box>

                <Box sx={{ width: "100%", height: {xs:"calc(100dvh - 99px - 40px)", md:"calc(100dvh - 99px)"}, position:'relative' }}>
                    <MapContainer
                        center={[cityState.mapCoords.lat, cityState.mapCoords.lon]}
                        zoom={16}
                        minZoom={12}
                        maxZoom={18}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                        {/*Instance boundary*/}
                        
                              <Polygon positions={[worldBounds,overlayCoords]}
                              pathOptions={{
                                fillOpacity: 0.3,
                                color: '#5a5a5a',
                                fillColor:'black'
                              }}>
                                <Popup>{`Overlay for ${instanceName}`}</Popup>
                              </Polygon>

                              
                              {amenities?.map(
                              (amenity,index) => {
                                //check the type
                                const type = amenity.type
                                if (type === 'point') {
                                    const iconURL = cityState.amenityCategories[amenity.category]?.icon ?? 'http://ontology.eil.utoronto.ca/cdt_resources/images/icons/health.png'
                                    console.log('iconURL: ',iconURL)

                                    return (
                                        <Marker
                                            icon={customAmenityMarker(iconURL)}
                                            key={index}
                                            position={[
                                                amenity.mapCoords.lat,
                                                amenity.mapCoords.lon,
                                            ]}
                                        >
                                        <Popup>{amenity.name}</Popup>
                                        </Marker>
                                    );
                                } else if (type === 'polygon') {
                                    return (
                                        <Polygon positions={amenity.mapCoords}
                                        pathOptions={{
                                            fillOpacity: 0.3,
                                            color: '#0c5203',
                                            fillColor:'green'
                                        }}>

                                        </Polygon>
                                    )
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
                        <Legend amenities={cityState.amenityCategories} />
                    </Box>

                    <Box
                    sx={{position:"absolute",
                        top:'6px',
                        left:'50px',
                        zIndex: 999,
                        maxWidth:'100%',
                        width:'400px'
                    }}>
                        <FilterPanel isOpen={filterPanelOpen} updateFilters={updateFilters} filterState={filterPanelState} amenityCategories={cityState.amenityCategories} />
                    </Box>
                </Box>

            </Stack>
            
        </Box>
    )
}

export default MapVisualComponent