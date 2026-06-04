import { useState, useEffect, useReducer } from "react";
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import ChartCustomizationModal from "./ChartCustomizationModal";
import ChartExpansionModal from "./ChartExpansionModal"

const ChartPanel = ({amenityData

        }) => {

    const [chartSelected, setChartSelected] = useState('Radar')
    const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
    const [openExpansionModal, setOpenExpansionModal] = useState(false)

    console.log('chart panel amenity data: ', amenityData)
    

    return (
        <Box sx={{width: '100%', height: 'auto', px:2, boxSizing:'border-box'}}>
            <Stack spacing={2} sx={{alignItems:"center", justifyContent:"center"}}>
                <Box sx={{width:"100%",flexDirection:"column",alignItems:"flex-start"}}>
                    <Typography variant="h4" style={{fontWeight:'bold', fontSize: '15px', color:'var(--text-dark)'}}>Walkability Coverage</Typography>
                    <Typography variant="h5" style={{fontSize: '12px', color: "var(--text-medium)"}}>The proportion (as a percentage) of houses that are within walking distance of each amenity type.</Typography>
                </Box>

                <Box sx={{width:"100%", display:"flex", justifyContent:"flex-end", gap:2, alignItems:"center"}}>
                    <Button startDecorator={<TuneIcon />} variant="soft" onClick={()=>{
                        setOpenExpansionModal(false)
                        setOpenCustomizationModal(true)
                        }}>
                        Customize Chart
                    </Button>
                    <IconButton variant="soft" onClick={()=>{
                        setOpenCustomizationModal(false)
                        setOpenExpansionModal(true)
                    }}>
                        <OpenInNewIcon />
                    </IconButton>
                </Box>

                {chartSelected === 'Radar' ? <AmenityRadarChart amenityData={amenityData} /> : null}

                <ChartCustomizationModal open={openCustomizationModal} onClose={()=>setOpenCustomizationModal(false)} chartSelected={chartSelected} amenityData={amenityData} />

                <ChartExpansionModal open={openExpansionModal} onClose={()=>setOpenExpansionModal(false)} chartSelected={chartSelected} amenityData={amenityData} openCustomization={()=>{
                    setOpenExpansionModal(false)
                    setOpenCustomizationModal(true)
                }}/>

            </Stack>
        </Box>
    )

}

export default ChartPanel