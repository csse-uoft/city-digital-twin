import { useState, useEffect } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Popup, Polygon, Tooltip, TileLayer, MapContainer, Marker } from "react-leaflet";
import { Input, Button, Select, Autocomplete, Option } from '@mui/joy';

const DefaultMap = ({
    instancePolygons,
    selectInstance
}) => {
    // console.log('default map instance polygons: ', instancePolygons)
    //Each iterable instance needs the following
    // overlayCoords, instance name, area type, and city name
    const defaultStyle = { color: '#449bd1', fill: false, weight:1  };
    const hoverStyle = { color: 'blue', fillOpacity:0.3, fillColor:'blue', weight:3, fill:true };
    const [selectedInstanceName, setSelectedInstanceName] = useState('')
    
    const handlePolygonClick = (areaInstanceName) => {
        // we just need to send the polygons information back to the parent
        console.log(`User clicked on ${areaInstanceName}`)
        setSelectedInstanceName(areaInstanceName)
        // selectInstance(areaInstanceName)
    };
    return(
        <Box sx={{width:'100%'}}>
            <Stack>
                <Box sx={{width:'100%',height:'50px',py:1,px:1,boxSizing:'border-box',borderBottom:"1px solid var(--border-color)",display:'flex',justifyContent:'flex-end',alignItems:'center'}}>
                    {selectedInstanceName === '' ? <Typography 
                                            variant="h5" 
                                            style={{
                                                fontSize:'14px',
                                                fontWeight:'semi-bold',
                                                color: 'var(--text-dark)'
                                            }}
                                            >No Area Selected
                                            </Typography> 
                                            : <Button size="sm" onClick={()=>selectInstance(selectedInstanceName)}>Select {selectedInstanceName}</Button>}
                </Box>
                <Box sx={{width:"100%", height:"calc(100dvh - 50px)"}}>
                    <MapContainer
                    center={[43.7, -79.42]}
                    zoom={12}
                    style={{ height:"100%", width:"100%"}}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    

                    {instancePolygons?.map((instance) => (
                        <Polygon
                        positions={instance.coordinates}
                        pathOptions={defaultStyle}
                        eventHandlers={{
                            mouseover: (e) => {
                            const layer = e.target;
                            layer.setStyle(hoverStyle); // Directly sets the Leaflet style
                            },
                            mouseout: (e) => {
                            const layer = e.target;
                            layer.setStyle(defaultStyle); // Resets to original
                            },
                            click: () => handlePolygonClick(instance.instanceName)
                        }}

                        >
                        <Popup>
                            {instance.instanceName}
                        </Popup>
                        </Polygon>
                    ))}
                    </MapContainer>
                </Box>
            </Stack>
        </Box>
    )
}

export default DefaultMap