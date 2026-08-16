import { useState, useEffect } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs, Dialog, DialogTitle } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadDoneOutlined'

//charts
import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import AmenityBarChart from '../../DataVisComponents/AmenityBarChart';
const ChartExpansionModal = ({
    onClose,
    open,
    chartSelected,
    openCustomization,
    walkabilityData,
    chartParameterState,
    areaURI
}) => {
    return(
        <Dialog open={open} onClose={onClose} PaperProps={{
            sx: {
        borderRadius: { xs: 0, md: '8px' },  // no border radius on full screen mobile
        width: { xs: '100%', md: '60%' },
        maxWidth: { xs: '100%', md: '900px' },  // override maxWidth on mobile too
        height: { xs: '100dvh', md: '70dvh' },
        maxHeight: { xs: '100dvh', md: '70dvh' },  // Dialog default maxHeight clips it
        backgroundColor: 'white',
        margin: { xs: 0, md: 'auto' },
        zIndex: 10010,
        position: 'relative'
    }}}
    sx={{
        '& .MuiDialog-container': {
        alignItems: { xs: 'flex-end', md: 'center' }  // optional: slides up from bottom on mobile
        }
    }}>
        <Box sx={{
            width:"100%", 
            height: '40px', 
            px:2, 
            display:"flex", 
            alignItems:"center", 
            justifyContent:"space-between", 
            boxSizing:"border-box", 
            borderBottom: "1px solid var(--border-color)",
            position:"absolute",
            top:0,
            left:0
            }}>
            <Typography variant="h3" style={{fontWeight:"semibold", fontSize:'16px'}}>Walkability Coverage Chart</Typography>
            <CloseIcon onClick={()=>onClose()} style={{color:'var(--text-medium)', cursor:'pointer'}} />
        </Box>
            <Box sx={{
            height:'100%',
            width:'100%',
            marginTop:'40px',
            marginBottom:'50px',
            boxSizing:"border-box",
            px:1,
            display:'flex',
            alignItems:"center",
            justifyContent:"center"
        }} >
            {chartSelected === 'Radar' ? <AmenityRadarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} key={areaURI} mode={chartParameterState[areaURI]?.chartView} /> : <AmenityBarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} key={areaURI} mode={chartParameterState[areaURI]?.chartView} />}

        </Box>

        <Box sx={{
            width:"100%", 
            height: '50px', 
            px:2, 
            py:1,
            display:"flex", 
            alignItems:"center", 
            justifyContent:"flex-end", 
            boxSizing:"border-box", 
            borderTop: "1px solid var(--border-color)",
            position:"absolute",
            bottom:0,
            left:0
            }}>
            

            <Box sx={{gap:1,  display:"flex", alignItems:"center"}}>
                <Button size="sm" startDecorator={<FileDownloadOutlinedIcon />} variant="outlined" color="neutral">Export</Button>
                <Button size="sm" startDecorator={<TuneIcon />} onClick={()=>openCustomization()} variant="outlined" color="primary">Customize Chart</Button>
            </Box>
            
        </Box>
        </Dialog>
    )
}

export default ChartExpansionModal