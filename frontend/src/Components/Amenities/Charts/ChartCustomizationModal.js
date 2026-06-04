import { useState, useEffect } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs, Dialog, DialogTitle } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadDoneOutlined'
//charts
import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
const ChartCustomizationModal = ({
    onClose, 
    open,
    updatedSelectedChart,
    chartSelected,
    amenityData
    }) => {

    const [tempSelection, setTempSelection] = useState(chartSelected ?? 'Radar')

    const resetToDefault = () => {
        setTempSelection(chartSelected)
    }

    const onChartSelectChange = (event, newValue) => {
        console.log('changing chart selection: ',newValue)
        setTempSelection(newValue)

    }

    useEffect(() => {

    },[tempSelection])

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
        zIndex: 10005,
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
            <Typography variant="h3" style={{fontWeight:"semibold", fontSize:'16px'}}>Customization</Typography>
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
            flexDirection: {xs: 'column', md:'row'}
        }} >
            <Box sx={{width: {xs: '100%', md: '250px'}, height: {xs: 'auto', md:'100%'}, flexShrink:0, borderRight: {xs:'none', md:"1px solid var(--border-color)"}}}>
                <Stack>
                    <Box sx={{width:'100%',display:"flex",flexDirection:"column",alignItems:"flex-start", gap:1,py:1,px:1, boxSizing:'border-box'}}>
                        <Typography variant="h3" style={{fontSize:14, fontWeight:"bold"}}>Chart Type</Typography>
                        <Select 
                            defaultValue="Radar" 
                            sx={{width:'100%'}} 
                            onChange={onChartSelectChange}
                            slotProps={{
                                listbox: {
                                sx: { zIndex: 9999 }
                                }
                            }}>
                            <Option value="Radar">Radar</Option>
                            <Option value="Bar">Bar</Option>
                        </Select>
                    </Box>
                </Stack>
            </Box>

            <Box sx={{width:'100%', height: { xs: 'auto', md:'100%'}, flex: 1, alignItems:'center', justifyContent:'center'}}>
                {tempSelection === 'Radar' ? <AmenityRadarChart amenityData={amenityData} /> : null}
            </Box>

        </Box>

        <Box sx={{
            width:"100%", 
            height: '50px', 
            px:2, 
            py:1,
            display:"flex", 
            alignItems:"center", 
            justifyContent:"space-between", 
            boxSizing:"border-box", 
            borderTop: "1px solid var(--border-color)",
            position:"absolute",
            bottom:0,
            left:0
            }}>
            <Button size="sm" variant="outlined" color="neutral" onClick={()=>resetToDefault()}>
                Reset to Default
            </Button>

            <Box sx={{gap:1,  display:"flex", alignItems:"center"}}>
                <Button size="sm" startDecorator={<FileDownloadOutlinedIcon />} variant="outlined" color="neutral">Export</Button>
                <Button size="sm" startDecorator={<SaveIcon />} color="primary">Save Changes</Button>
            </Box>
            
        </Box>

        </Dialog>
    )
}

export default ChartCustomizationModal