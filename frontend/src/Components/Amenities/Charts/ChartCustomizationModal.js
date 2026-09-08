import { useState, useEffect } from 'react'
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs, Dialog, DialogTitle, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadDoneOutlined'
//charts
import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import AmenityBarChart from '../../DataVisComponents/AmenityBarChart'

import ChartCategoryFilter from './ChartCategoryFilter'
import ChartSubtypeFilter from './ChartSubtypeFilter'
const ChartCustomizationModal = ({
    parameterStateKey,
    onClose, 
    open,
    // updateSelectedChart,
    chartSelected,
    walkabilityData,
    chartEditParameterState,
    chartParameterState,
    dispatchChartEditParameterState,
    dispatchChartParameterState
    }) => {

    const currentChartState = chartEditParameterState?.[parameterStateKey] ?? chartParameterState?.[parameterStateKey] ?? {};
    const tempSelection = currentChartState.chartSelected ?? 'Bar';
    const view = currentChartState.chartView ?? 'category';

    const resetToDefault = () => {
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id: parameterStateKey,
                state: structuredClone(chartParameterState[parameterStateKey])
            }
        })
        // setTempSelection(chartSelected)
    }

    useEffect(() => {
        // console.log('chart param state: ',chartParameterState)
        // console.log('chart edit param state: ', chartEditParameterState)
    }, [chartParameterState, chartEditParameterState])
    // const [visibleCategories, setVisibleCategories] = useState(() => {
    //     const areaNames = Object.keys(walkabilityData)
    //     const categoryNames = [
    //       ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    //     ]
    //     let obj = {}
    //     categoryNames.forEach((name) => {
    //       obj[name] = true
    //     })
    //     return obj
    //   })
    
    //   const [visibleSubtypes, setVisibleSubtypes] = useState(() => {
    //     const areaNames = Object.keys(walkabilityData)
    //     const categoryNames = [
    //       ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    //     ]
    //     let subtypeMap = {}
    //     categoryNames.forEach((name) => {
    //       //iterate over the areas 
    //       let totalSubtypes = []
    //       areaNames.forEach((area) => {
    //         const subtypes = walkabilityData[area][name].subtypes
    //         totalSubtypes = [
    //           ...new Set([...totalSubtypes, subtypes])
    //         ]
    
    //       })
    
    //       const obj = Object.entries(totalSubtypes.map(item => [item, true]))
    //       subtypeMap[name] = obj
    //     })
    
    //     return subtypeMap
    //   })

    const onChartSelectChange = (event, newValue) => {
        //console.log('changing chart selection: ',newValue)
        //set filters to previous saved
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id:parameterStateKey,
                state: {
                    ...(chartEditParameterState[parameterStateKey] ?? chartParameterState[parameterStateKey] ?? {}),
                    chartSelected: newValue
                }
            }
        })
    }

    const onChartCategoryFilterChange = (newValue) => { //update the chart edit parameter state
        //console.log('SEEE MEEEE') 
        console.dir(newValue, {depth:null})

        // const nextState = {...chartEditParameterState}
        // nextState[parameterStateKey].category = newValue
        
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id: parameterStateKey,
                state: {
                    ...chartEditParameterState[parameterStateKey],
                    category: newValue
                }
            }
        })
    }

    const onChartSubtypeFilterChange =(newValue) => {
        //console.log('updating chart category filters')
        console.dir(newValue, {depth:null})
        
        // const nextState = {...chartEditParameterState}
        // nextState[parameterStateKey].subtype = newValue
        
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id: parameterStateKey,
                state: {
                    ...chartEditParameterState[parameterStateKey],
                    subtype: newValue
                }
            }
        })
    }

    const updateChartView = (newChartView) => {
        // let nextState = {...chartEditParameterState[parameterStateKey]}
        // nextState.chartView = newChartView
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id: parameterStateKey,
                state: {
                    ...chartEditParameterState[parameterStateKey],
                    chartView: newChartView
                }
            }
        })
    }

    const saveChanges = () => {
        //console.log('saving chart changes')
        //save changes to state
        dispatchChartParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id:parameterStateKey,
                state: chartEditParameterState[parameterStateKey]
            }
        })

        //update selection
        // updateSelectedChart(tempSelection)
    }

    const closeChartCustomizationModal = () => {
        //reset the chart edit state
        //console.log('closing chart customization modal')
        dispatchChartEditParameterState({
            type:'SET_PARAMETERS',
            payload: {
                id: parameterStateKey,
                state: structuredClone(chartParameterState[parameterStateKey])
            }
        })

        //close the modal
        onClose()
    }

    const exportChart = () => {
        //console.log('Exporting chart...')
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
        zIndex: 100010,
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
            <CloseIcon onClick={()=>closeChartCustomizationModal()} style={{color:'var(--text-medium)', cursor:'pointer'}} />
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
                            // defaultValue={chartSelected}
                            value={tempSelection}
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

                    <Box sx={{width:'100%',display:"flex",flexDirection:"column",alignItems:"flex-start", gap:1,py:1,px:1, boxSizing:'border-box'}}>
                        <Typography variant="h3" style={{fontSize:14, fontWeight:"bold"}}>View</Typography>
                        <ToggleButtonGroup
                            value={view}
                            exclusive                    // only one can be selected at a time
                            onChange={(e, newValue) => { 
                                if (newValue) {
                                    updateChartView(newValue)
                                } 
                            }}
                            size="small"
                            sx={{
                                backgroundColor: '#f0f0f0',
                                borderRadius: '8px',
                                width:'100%',
                                padding: '3px',
                                border: 'none',
                                '& .MuiToggleButtonGroup-grouped': {
                                    border: 'none',
                                    borderRadius: '6px !important',  // !important overrides MUI's grouped border-radius reset
                                },
                                boxSizing:'border-box'
                            }}
                        >
                            <ToggleButton 
                                // onChange={()=>setView('category')}
                                value="category"
                                disableRipple
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    px: 2,
                                    py: 0.5,
                                    width:'100%',
                                    color: '#888',
                                    '&.Mui-selected': {
                                        backgroundColor: 'white',
                                        color: '#333',
                                        fontWeight: '600',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                        '&:hover': { backgroundColor: 'white' }
                                    },
                                    '&:hover': { backgroundColor: 'transparent' }
                                }}
                                >By Category</ToggleButton>
                            <ToggleButton
                                // onChange={()=>setView('subtype')} 
                                value="subtype"
                                disableRipple
                                sx={{
                                    textTransform: 'none',
                                    fontSize: '13px',
                                    px: 2,
                                    py: 0.5,
                                    width:'100%',
                                    color: '#888',
                                    '&.Mui-selected': {
                                        backgroundColor: 'white',
                                        color: '#333',
                                        fontWeight: '600',
                                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                        '&:hover': { backgroundColor: 'white' }
                                    },
                                    '&:hover': { backgroundColor: 'transparent' }
                                }}>By Subtype</ToggleButton>
                        </ToggleButtonGroup>
                        {view === 'category' ? <ChartCategoryFilter categoryFilterState={chartEditParameterState[parameterStateKey]?.category} onChange={onChartCategoryFilterChange} /> : <ChartSubtypeFilter subtypeFilterState={chartEditParameterState[parameterStateKey]?.subtype} onChange={onChartSubtypeFilterChange} />}
                    </Box>
                </Stack>
            </Box>

            <Box sx={{width:'100%', height: { xs: 'auto', md:'100%'}, flex: 1, alignItems:'center', justifyContent:'center', overflowX:'auto'}}>
                {tempSelection === 'Radar' ? <AmenityRadarChart walkabilityData={walkabilityData} chartParameterState={chartEditParameterState} chartParameterKey={parameterStateKey} mode={view} /> : <AmenityBarChart walkabilityData={walkabilityData} chartParameterState={chartEditParameterState} chartParameterKey={parameterStateKey} mode={view} />}
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
                <Button onClick={()=>exportChart()} size="sm" startDecorator={<FileDownloadOutlinedIcon />} variant="outlined" color="neutral">Export</Button>
                <Button onClick={()=>saveChanges()} size="sm" startDecorator={<SaveIcon />} color="primary">Save Changes</Button>
            </Box>
            
        </Box>

        </Dialog>
    )
}

export default ChartCustomizationModal