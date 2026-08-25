import { useState, useEffect, useReducer } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Popup, Polygon, Tooltip, TileLayer, MapContainer, Marker } from "react-leaflet";
import { Input, Button, Select, Autocomplete, Option, CircularProgress } from '@mui/joy';
import { customAmenityMarker } from '../../helpers/utils'
import { fetchAreaAmenities } from '../../helpers/fetchFunctions'

import Legend from './Legend';
import FilterPanel from './FilterPanel'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';

import L from "leaflet";
import "leaflet/dist/leaflet.css";

//icons
import busIcon from '../../assets/icons/udrc-bus-icon.png'
  

function plotAmenity (amenity,index,cityState) {
    // //console.log('plotting amenity: ',amenity)
    const type = amenity.type
    if (type === 'point') {
        const iconURL = cityState.amenityCategories[amenity.category]?.icon ?? busIcon
        // //console.log('iconURL: ',iconURL)

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
}

const MapVisualComponent = ({
    instanceName,
    instanceURL,
    overlayCoords,
    centerCoords,
    locationIDKey,
    cityState,
    filterPanelState,
    dispatchFilterPanelState
}) => {

    //console.log('MCV Filter State: ',filterPanelState)
    const [filterPanelOpen, setFilterPanelOpen] = useState(false)
    const [amenities, setAmenities] = useState([])
    const [loadingAmenities, setLoadingAmenities] = useState(false)

    useEffect(() => {
        const getAreaAmenities = async () => {
            try {
                setLoadingAmenities(true)
                const amenities = await fetchAreaAmenities(instanceURL,cityState.cityURI)
                //console.log('MVC amenities: ', amenities)
                setAmenities(amenities)
            } catch (err) {
                console.error('ERR loading area amenities: ',err)
            } finally {
                setLoadingAmenities(false)
            }
            
        }

        getAreaAmenities()
    },[])


    const updateFilters = (category, filter) => {
        // //console.log('updating filters')
        // //console.log('old filterState: ',filterPanelState)
        const prevState = filterPanelState
        const categoryState = prevState[category];

        if (filter === 'all') {
            const newSubtypes = Object.fromEntries(
                Object.keys(categoryState)
                    .filter((key) => key !== 'showAll')
                    .map((key) => [key, { show: true }])
            );
            const newState = {
                ...prevState,
                [category]: { showAll: true, ...newSubtypes }
            };
            dispatchFilterPanelState({
                type:'SET_FILTER',
                payload: {
                    id: locationIDKey,
                    state: newState
                }
            })
            return
        }

        if (categoryState[filter] === undefined) {
            console.warn(`Filter key "${filter}" not found in filterPanelState`);
            // return prevState;
            return
        }


        const newState = {
            ...prevState,
            [category]: {
                ...categoryState,
                showAll: false, // ✅ leaving "show all" mode
                [filter]: { show: !categoryState[filter].show }
            }
        };
        dispatchFilterPanelState({
            type:'SET_FILTER',
            payload: {
                id: locationIDKey,
                state: newState
            }
        })
        return
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
                    <Button disabled={!filterPanelState} size="sm" variant="outlined" color="neutral" startDecorator={<FilterAltOutlinedIcon />} onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
                        Filter
                    </Button>

                    <Button disabled={true} size="sm" variant="outlined" color="neutral" startDecorator={<CircleOutlinedIcon />}>
                        Catchment Area
                    </Button>

                    {loadingAmenities && <Typography variant="h4" style={{fontSize:14, color: 'var(--text-medium)'}}>Loading Amenities...</Typography>}
                </Box>

                <Box sx={{ width: "100%", height: {xs:"calc(100dvh - 99px - 40px)", md:"calc(100dvh - 99px)"}, position:'relative' }}>
                    <MapContainer
                        center={[centerCoords?.lat ?? cityState?.mapCoords?.lat ?? 43.65323, centerCoords?.lon ?? cityState?.mapCoords?.lon ?? -79.38318]}
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


                            {filterPanelState && Object.keys(amenities)?.flatMap((category) => {
                                const categoryFilter = filterPanelState[category];
                                if (!categoryFilter) return [];

                                const subtypes = Object.keys(amenities[category]);

                                if (categoryFilter.showAll) {
                                    // show every subtype
                                    return subtypes.flatMap((subtype) =>
                                        (amenities[category][subtype] ?? []).map((amenity, index) =>
                                            plotAmenity(amenity, `${category}-${subtype}-${index}`, cityState)
                                        )
                                    );
                                } else {
                                    // only show subtypes that are individually toggled on
                                    return subtypes
                                        .filter((subtype) => filterPanelState[category][subtype]?.show)
                                        .flatMap((subtype) =>
                                            (amenities[category][subtype] ?? []).map((amenity, index) =>
                                                plotAmenity(amenity, `${category}-${subtype}-${index}`, cityState)
                                            )
                                        );
                                }
                            })}
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