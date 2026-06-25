import { useState, useEffect } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs, Dialog, DialogTitle, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import AmenityBarChart from '../../DataVisComponents/AmenityBarChart'

import ChartPanel from '../Charts/ChartPanel'
import TabularBreakdownComponent from './TabularBreakdownComponent'

const ComparisonModal = ({
    onClose,
    open,
    amenityData
}) => {
    const numInstances = Object.keys(amenityData).length
    const [chartSelected, setChartSelected] = useState('Radar')
    const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
    const [openExpansionModal, setOpenExpansionModal] = useState(false)
    return(
        <Dialog open={open} onClose={onClose} PaperProps={{
            sx: {
                //borderRadius: { xs: 0, md: '8px' },  // no border radius on full screen mobile
                width: '100%',
                maxWidth: { xs: '100%' },  // override maxWidth on mobile too
                height: { xs: '100dvh' },
                maxHeight: { xs: '100dvh' },  // Dialog default maxHeight clips it
                backgroundColor: 'white',
                margin: { xs: 0, md: 'auto' },
                zIndex: 10005,
                display:'flex',
                flexDirection:'column',
                justifyContent:"flex-start"
            }}}
            sx={{
            '& .MuiDialog-container': {
            alignItems: { xs: 'flex-end', md: 'center' },  // optional: slides up from bottom on mobile
            justifyContent:'flex-start',
            flexDirection:'column'
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
            // position:"absolute",
            // top:0,
            // left:0
            }}>
            <Typography variant="h3" style={{fontWeight:"bold", fontSize:'16px'}}>{numInstances} Area Instances Selected For Comparison</Typography>
            <CloseIcon onClick={()=>onClose()} style={{color:'var(--text-medium)', cursor:'pointer'}} />
        </Box>
        <Box sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            px: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height:'calc(100dvh)'
        }} >
            {
                numInstances >= 2 ? (
                    <>
                    <Box sx={{width: {xs: '100%', md: '450px'}, p:1, boxSizing:"border-box", height: {xs: 'auto', md:'100%'}, flexShrink:0, borderRight: {xs:'none', md:"1px solid var(--border-color)"}}}>
                        <ChartPanel amenityData={amenityData} />
                    </Box>

                    <Box sx={{width:'100%', height: { xs: 'auto', md:'100%'}, flex: 1, alignItems:'center', justifyContent:'center'}}>
                        <TabularBreakdownComponent amenityData={amenityData} />
                    </Box>
                    </>
                ) : (
                    <Box sx={{width:'100%',p:1,boxSizing:'border-box', height: {xs: 'auto', md:'100%'}, display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Typography variant="h3" style={{color:'var(--text-dark)', fontSize: 18}}>Please Select Atleast 2 Area Instances to Compare</Typography>
                    </Box>
                )
            }
            



        </Box>

        </Dialog>
    )
}

export default ComparisonModal