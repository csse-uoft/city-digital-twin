import { useState, useEffect, useReducer, useMemo } from "react";
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option, CircularProgress } from '@mui/joy';
import TuneIcon from '@mui/icons-material/Tune';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import AmenityRadarChart from '../../DataVisComponents/AmenityRadarChart'
import AmenityBarChart from '../../DataVisComponents/AmenityBarChart'
import ChartCustomizationModal from "./ChartCustomizationModal";
import ChartExpansionModal from "./ChartExpansionModal"
import { fetchWalkabilityData } from '../../../helpers/fetchFunctions'

function isMultiArea (areaURIList) {
    const areas = Object.keys(areaURIList)
    return areas.length > 1
}

function createParameterStateKey (areaURIList) {
    return Object.keys(areaURIList).sort().join('_')
}

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
    //console.log('initialized chart category param state: ',obj)
    return obj
}

function initializeChartSubtypeParameterState (walkabilityData,amenityCategories) {
    const areaNames = Object.keys(walkabilityData)
    const categoryNames = [
        ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    ]
    // //console.log('category names: ', categoryNames)
    let subtypeMap = {}
    categoryNames.forEach((name) => {
        //iterate over the areas 
        let totalSubtypes = []
        areaNames.forEach((area) => {
        const subtypes = walkabilityData[area][name]?.subtypes.map(k => k.subtype) ?? []
        // //console.log(`subtypes of category ${name} in area ${area}: `,subtypes)
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
    // //console.log('initialized chart subtype param state:')
    // console.dir(subtypeMap, { depth: null})
    return subtypeMap
}

const ChartPanel = ({
    areaURI,
    areaName,
    cityURI,
    areaURIList,
    amenityCategories,
    chartParameterState,
    dispatchChartParameterState,
    chartEditParameterState,
    dispatchChartEditParameterState
        }) => {

    
    const [chartView, setChartView] = useState('category')
    const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
    const [openExpansionModal, setOpenExpansionModal] = useState(false)
    const [walkabilityData, setWalkabilityData] = useState({})
    const [formattedWalkabilityData, setFormattedWalkabilityData] = useState({})
    const [loading, setLoading] = useState(false)

    //console.log('chart panel amenity data: ', walkabilityData)
    //console.log('chart panel amenity categories: ', amenityCategories)

    const multiArea = useMemo(() => { return isMultiArea(areaURIList)}, [areaURIList])

    const parameterStateKey = useMemo(() => { return createParameterStateKey(areaURIList)}, [areaURIList])

    const chartSelected = useMemo(() => {
        return chartParameterState[parameterStateKey]?.chartSelected ?? 'Bar'
    }, [chartParameterState,parameterStateKey])

    useEffect(() => {
        //fetch the data
        if(!parameterStateKey) return
        const getData = async () => {
            try {
                setLoading(true)
                if (multiArea) { //there are multiple areas (comparison)

                    //get the walkabilityData for all the areas and construct
                    let obj = {}
                    const dataResult = await Promise.all(Object.keys(areaURIList).map(async (uri) => ({areaName: areaURIList[uri], data: await fetchWalkabilityData(uri,cityURI)})))
                    dataResult.forEach((item) => {
                        obj[item.areaName] = item.data
                    })
                    setWalkabilityData(obj)
                    console.log('multi area walkability data: ',obj)
                    //initialization of the filter state

                    //create the key

                    if (!Object.hasOwn(chartParameterState,parameterStateKey)) {
                        const chartCategoryParamState = initializeChartCategoryParameterState(obj,amenityCategories)

                        const chartSubtypeParamState = initializeChartSubtypeParameterState(obj,amenityCategories)

                        const initialParamState = {
                            category: chartCategoryParamState,
                            subtype: chartSubtypeParamState,
                            chartView: chartView,
                            chartSelected: chartSelected
                        }

                        dispatchChartParameterState({
                            type:'SET_PARAMETERS',
                            payload: {
                                id: parameterStateKey,
                                state: initialParamState
                            }
                        })

                        dispatchChartEditParameterState({
                            type:'SET_PARAMETERS',
                            payload: {
                                id: parameterStateKey,
                                state: structuredClone(initialParamState)
                            }
                        })
                    }

                } else { //there is only one area 
                    const areaURI = Object.keys(areaURIList).at(0)
                    const data = await fetchWalkabilityData(areaURI,cityURI)
                    const formattedWD = formatWalkabilityData(data,areaName)
                    setWalkabilityData(formattedWD)

                    //check if filter states are not initialized for the area URI already
                    if (!Object.hasOwn(chartParameterState,areaURI)) {
                        //initialize filter states
                        //console.log('initializing new parameter states for instance ',areaURI)
                        const chartCategoryParamState = initializeChartCategoryParameterState(formattedWD,amenityCategories)

                        const chartSubtypeParamState = initializeChartSubtypeParameterState(formattedWD,amenityCategories)

                        const initialParamState = {
                            category: chartCategoryParamState,
                            subtype: chartSubtypeParamState,
                            chartView: chartView,
                            chartSelected: chartSelected
                        }

                        dispatchChartParameterState({
                            type:'SET_PARAMETERS',
                            payload: {
                                id: parameterStateKey,
                                state: initialParamState
                            }
                        })

                        dispatchChartEditParameterState({
                            type:'SET_PARAMETERS',
                            payload: {
                                id: parameterStateKey,
                                state: structuredClone(initialParamState)
                            }
                        })
                    }
                
                }

                
            } catch (err) {
                console.error('Failed to get walkability data in chartpanel: ',err)
            } finally {
                setLoading(false)
            }
        }
        getData()

    },[parameterStateKey])
    
    // console.log('walkability data: ', walkabilityData)
    // console.log('chart param state: ', chartParameterState)
    // console.log('state key: ', parameterStateKey)
    return (
        <Box sx={{width: '100%', height: 'auto', px:2, boxSizing:'border-box'}}>
            <Stack spacing={2} sx={{alignItems:"center", justifyContent:"center"}}>
                <Box sx={{width:"100%",flexDirection:"column",alignItems:"flex-start"}}>
                    <Typography variant="h4" style={{fontWeight:'bold', fontSize: '15px', color:'var(--text-dark)'}}>Walkability Coverage</Typography>
                    <Typography variant="h5" style={{fontSize: '12px', color: "var(--text-medium)"}}>The proportion (as a percentage) of houses that are within walking distance of each amenity type.</Typography>
                </Box>

                <Box sx={{width:"100%", display:"flex", justifyContent:"flex-end", gap:2, alignItems:"center"}}>
                    <Button disabled={loading || !walkabilityData || chartEditParameterState[parameterStateKey] == undefined || chartParameterState[parameterStateKey] == undefined} startDecorator={<TuneIcon />} variant="soft" onClick={()=>{
                        setOpenExpansionModal(false)
                        setOpenCustomizationModal(true)
                        }}>
                        Customize Chart
                    </Button>
                    <IconButton disabled={loading || !walkabilityData || chartEditParameterState[parameterStateKey] == undefined || chartParameterState[parameterStateKey] == undefined} variant="soft" onClick={()=>{
                        setOpenCustomizationModal(false)
                        setOpenExpansionModal(true)
                    }}>
                        <OpenInNewIcon />
                    </IconButton>
                </Box>
                
                {loading || !walkabilityData || chartEditParameterState[parameterStateKey] == undefined || chartParameterState[parameterStateKey] == undefined ? (<CircularProgress />) : chartSelected === 'Radar' ? <AmenityRadarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} chartParameterKey={parameterStateKey} mode={chartParameterState[parameterStateKey]?.chartView ?? 'category'} /> : <AmenityBarChart walkabilityData={walkabilityData} chartParameterState={chartParameterState} chartParameterKey={parameterStateKey} mode={chartParameterState[parameterStateKey]?.chartView ?? 'category'} />}

                <ChartCustomizationModal 
                    parameterStateKey={parameterStateKey}
                    // updateSelectedChart={(chart) => setChartSelected(chart)} 
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
                    parameterStateKey={parameterStateKey} 
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