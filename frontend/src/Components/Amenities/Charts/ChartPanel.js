import { useState, useEffect, useReducer } from "react";
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option, CircularProgress } from '@mui/joy';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import AmenityBarChart from '../../DataVisComponents/AmenityBarChart'
import ChartCustomizationModal from "./ChartCustomizationModal";
import ChartExpansionModal from "./ChartExpansionModal"
import { fetchWalkabilityData } from '../../../helpers/fetchFunctions'

function formatWalkabilityData (data,areaName) {
    let obj = {}
    obj[areaName] = data
    return obj
}

function initializeChartCategoryParameterState (walkabilityData,amenityCategories) {
    const areaNames = Object.keys(walkabilityData)
    const categoryNames = [
        ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    ]
    let obj = {}
    categoryNames.forEach((name) => {
        obj[name] = {
            show: true,
            icon: amenityCategories[name]?.icon ?? ''
        }
    })
    console.log('initialized chart category param state: ',obj)
    return obj
}

function initializeChartSubtypeParameterState (walkabilityData,amenityCategories) {
    const areaNames = Object.keys(walkabilityData)
    const categoryNames = [
        ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    ]
    // console.log('category names: ', categoryNames)
    let subtypeMap = {}
    categoryNames.forEach((name) => {
        //iterate over the areas 
        let totalSubtypes = []
        areaNames.forEach((area) => {
        const subtypes = walkabilityData[area][name].subtypes.map(k => k.subtype)
        // console.log(`subtypes of category ${name} in area ${area}: `,subtypes)
        totalSubtypes = [
            ...new Set([...totalSubtypes, ...subtypes])
        ]

        })
        let obj = {}
        totalSubtypes.forEach((item) => {
            obj[item] = {
                show: true,
                icon: amenityCategories[name]?.icon ?? ''
            }
        })
        // const obj = Object.entries(totalSubtypes.map(item => [item, true]))
        subtypeMap[name] = obj
    })
    // console.log('initialized chart subtype param state:')
    // console.dir(subtypeMap, { depth: null})
    return subtypeMap
}

const ChartPanel = ({
    areaURI,
    areaName,
    cityURI,
    chartCategoryParameterState,
    dispatchChartCategoryParameterState,
    chartSubtypeParameterState,
    dispatchChartSubtypeParameterState,
    amenityCategories,
    chartParameterState,
    dispatchChartParameterState,
    chartEditParameterState,
    dispatchChartEditParameterState
        }) => {

    const [chartSelected, setChartSelected] = useState('Bar')
    const [chartView, setChartView] = useState('category')
    const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
    const [openExpansionModal, setOpenExpansionModal] = useState(false)
    const [walkabilityData, setWalkabilityData] = useState({})
    const [formattedWalkabilityData, setFormattedWalkabilityData] = useState({})
    const [loading, setLoading] = useState(false)

    console.log('chart panel amenity data: ', walkabilityData)
    console.log('chart panel amenity categories: ', amenityCategories)

    // useEffect(() => {
    //     if(!walkabilityData) return
    //     //check if a state already exist

    //     //initialize the filter param models

    //     const chartCategoryParamState = initializeChartCategoryParameterState(walkabilityData,amenityCategories)

    //     const chartSubtypeParamState = initializeChartSubtypeParameterState(walkabilityData,amenityCategories)


    //     //dispatch the filter models
    //     dispatchChartCategoryParameterState({
    //         type:'SET_PARAMETERS',
    //         payload: {
    //             id: areaURI,
    //             state: chartCategoryParamState
    //         }
    //     })

    //     dispatchChartSubtypeParameterState({
    //         type:'SET_PARAMETERS',
    //         payload: {
    //             id: areaURI,
    //             state: chartSubtypeParamState
    //         }
    //     })

    //     dispatchChartParameterState({
    //         type:'SET_PARAMETER',
    //         payload: {
    //             id: areaURI,
    //             state: {
    //                 category: chartCategoryParamState,
    //                 subtype: chartSubtypeParamState
    //             }
    //         }
    //     })

    //     dispatchChartEditParameterState({
    //         type:'SET_PARAMETER',
    //         payload: {
    //             id: areaURI,
    //             state: {
    //                 category: chartCategoryParamState,
    //                 subtype: chartSubtypeParamState
    //             }
    //         }
    //     })

    // }, [walkabilityData])



    useEffect(() => {
        //fetch the data
        const getData = async () => {
            try {
                setLoading(true)
                const data = await fetchWalkabilityData(areaURI,cityURI)
                const formattedWD = formatWalkabilityData(data,areaName)
                setWalkabilityData(formattedWD)

                //check if filter states are not initialized for the area URI already

                //initialize filter states
                const chartCategoryParamState = initializeChartCategoryParameterState(formattedWD,amenityCategories)

                const chartSubtypeParamState = initializeChartSubtypeParameterState(formattedWD,amenityCategories)

                dispatchChartParameterState({
                    type:'SET_PARAMETERS',
                    payload: {
                        id: areaURI,
                        state: {
                            category: chartCategoryParamState,
                            subtype: chartSubtypeParamState,
                            chartView: chartView
                        }
                    }
                })

                dispatchChartEditParameterState({
                    type:'SET_PARAMETERS',
                    payload: {
                        id: areaURI,
                        state: {
                            category: chartCategoryParamState,
                            subtype: chartSubtypeParamState,
                            chartView: chartView
                        }
                    }
                })
            } catch (err) {
                console.error('Failed to get walkability data in chartpanel: ',err)
            } finally {
                setLoading(false)
            }
        }
        getData()

    },[areaURI])
    

    return (
        <Box sx={{width: '100%', height: 'auto', px:2, boxSizing:'border-box'}}>
            <Stack spacing={2} sx={{alignItems:"center", justifyContent:"center"}}>
                <Box sx={{width:"100%",flexDirection:"column",alignItems:"flex-start"}}>
                    <Typography variant="h4" style={{fontWeight:'bold', fontSize: '15px', color:'var(--text-dark)'}}>Walkability Coverage</Typography>
                    <Typography variant="h5" style={{fontSize: '12px', color: "var(--text-medium)"}}>The proportion (as a percentage) of houses that are within walking distance of each amenity type.</Typography>
                </Box>

                <Box sx={{width:"100%", display:"flex", justifyContent:"flex-end", gap:2, alignItems:"center"}}>
                    <Button disabled={loading || !walkabilityData || chartEditParameterState[areaURI] == undefined || chartParameterState[areaURI] == undefined} startDecorator={<TuneIcon />} variant="soft" onClick={()=>{
                        setOpenExpansionModal(false)
                        setOpenCustomizationModal(true)
                        }}>
                        Customize Chart
                    </Button>
                    <IconButton disabled={loading || !walkabilityData || chartEditParameterState[areaURI] == undefined || chartParameterState[areaURI] == undefined} variant="soft" onClick={()=>{
                        setOpenCustomizationModal(false)
                        setOpenExpansionModal(true)
                    }}>
                        <OpenInNewIcon />
                    </IconButton>
                </Box>
                
                {loading || !walkabilityData || chartEditParameterState[areaURI] == undefined || chartParameterState[areaURI] == undefined ? (<CircularProgress />) : chartSelected === 'Radar' ? <AmenityRadarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} chartParameterKey={areaURI} mode={chartParameterState[areaURI]?.chartView ?? 'category'} /> : <AmenityBarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} chartParameterKey={areaURI} mode={chartParameterState[areaURI]?.chartView ?? 'category'} />}

                <ChartCustomizationModal 
                    areaURI={areaURI}
                    updateSelectedChart={(chart) => setChartSelected(chart)} 
                    open={openCustomizationModal} onClose={()=>setOpenCustomizationModal(false)} 
                    chartSelected={chartSelected} 
                    walkabilityData={walkabilityData} 
                    chartEditParameterState={chartEditParameterState}
                    chartParameterState={chartParameterState}
                    dispatchChartEditParameterState={dispatchChartEditParameterState}
                    dispatchChartParameterState={dispatchChartParameterState}

                />

                <ChartExpansionModal 
                    open={openExpansionModal} 
                    onClose={()=>setOpenExpansionModal(false)} 
                    chartSelected={chartSelected} 
                    walkabilityData={walkabilityData} 
                    chartParameterState={chartParameterState} 
                    areaURI={areaURI} 
                    openCustomization={()=>{
                    setOpenExpansionModal(false)
                    setOpenCustomizationModal(true)
                    }}
                />

                <Box sx={{width:'100%',px:1,py:1,display:'flex',flexDirection:'column',alignItems:"flex-start",gap:1}}>
                    <Typography variant="h3" style={{fontSize:16, fontWeight:'bold', color:'var(--text-dark)'}}>Data Source</Typography>
                    <Typography style={{fontSize:12, color:'var(--text-medium)'}}>Data retrieved from OpenStreetMaps</Typography>
                    <Typography style={{fontSize:12, color:'var(--text-medium)'}}>Last Updated: June 2026</Typography>
                </Box>

            </Stack>
        </Box>
    )

}

export default ChartPanel