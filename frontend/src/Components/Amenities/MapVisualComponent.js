import { useState, useEffect, useReducer } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import { Popup, Polygon, Tooltip, TileLayer, MapContainer, Marker } from "react-leaflet";
import { Input, Button, Select, Autocomplete, Option } from '@mui/joy';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import L from "leaflet";
import "leaflet/dist/leaflet.css";


const MapVisualComponent = () => {


    return(
        <Box sx={{width:"100%"}}>
            <Stack>
                <Box sx={{width:"100%", px:1, display:"flex", py:1, boxSizing:"border-box", height: "50px",borderBottom:"1px solid", backgroundColor:"white", alignItems:"center", justifyContent:"flex-start", gap:2}}>
                    <Button variant="outlined" color="neutral" startDecorator={<FilterAltOutlinedIcon />}>
                        Filter
                    </Button>

                    <Button variant="outlined" color="neutral" startDecorator={<CircleOutlinedIcon />}>
                        Catchment Area
                    </Button>
                </Box>

                <Box sx={{ width: "100%", height: "calc(100dvh - 50px)" }}>
                    <MapContainer
                        center={[43.7, -79.42]}
                        zoom={12}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </MapContainer>
                </Box>

            </Stack>
            
        </Box>
    )
}

export default MapVisualComponent