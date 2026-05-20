import { useState, useEffect, useReducer } from "react";
import { Box, Container, Grid, Paper, Stack, Typography } from "@mui/material";
import { Input, Button, Select, Autocomplete, Option } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import MapVisualComponent from './MapVisualComponent'

import noDataImg from '../../assets/images/Illustration.png'

const Amenities = () => {
    const [showSidePanel, setShowSidePanel] = useState(true)
    const [showMap, setShowMap] = useState(true)

    const [areaType, setAreaType] = useState("")
    const [areaInstance, setAreaInstance] = useState("")
    const [startYear, setStartYear] = useState("")
    const [endYear, setEndYear] = useState("")
    const [autocompleteOptions, setAutocompleteOptions] = useState([])

    const [population, setPopulation] = useState(null)
    const [density, setDensity] = useState(null)
    const [data, setData] = useState(null)

    const [saveLoading, setSaveLoading] = useState(false)
    const [exportLoading, setExportLoading] = useState(false)



    const handleAreaTypeChange = (event) => {
        if (!event?.target?.value) return
        console.log('user selected area type: ', event.target.value)
        setAreaType(event.target.value)
    }

    const handleAreaInstanceChange = (event) => {
        if (!event?.target?.value) return
        console.log('user selected area instance', event.target.value)
        setAreaInstance(event.target.value)
    }

    return (
        <Box sx={{width:"100%",marginRight: 0, marginLeft: 0}}>
            <Box
            sx={{ display: "flex", height: "100%", width:"100%" }}>
                {showSidePanel === true && (
                    <Box sx={{ width: {xs:"100%", md:"420px"}, flexShrink: 0, borderRight: {md: '1px solid grey'}, px: 2, position:"relative", boxSizing:"border-box" }}>
                        <Stack spacing={2}>

                            <Box sx={{width:"100%", flexDirection: "column", alignItems: "flex-start", gap: 2, marginTop: { xs: "100px !important", md:"20px !important" }}}>
                                <Typography
                                    variant="h5"
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "semibold",
                                        color: "#202020",
                                        marginBottom: '4px'
                                    }}
                                    >
                                    Area Type
                                    </Typography>
                                <Select placeholder="Select an area type" onChange={handleAreaTypeChange}>
                                    <Option value="neighbourhood">Neighboorhood</Option>
                                </Select>
                            </Box>


                            <Box sx={{width:"100%", flexDirection: "column", alignItems: "flex-start", gap: 2, mt: 4}}>
                                <Typography
                                    variant="h5"
                                    style={{
                                        // fontFamily: "Inter, sans-serif",
                                        fontSize: 14,
                                        fontWeight: "semibold",
                                        color: "#202020",
                                        marginBottom: '4px'
                                    }}
                                    >
                                    {areaType === "" ? 'No area type selected' : `${areaType}`}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    style={{
                                        // fontFamily: "Inter, sans-serif",
                                        fontSize: 12,
                                        fontWeight: "semi-bold",
                                        color: "#4b4b4b",
                                        marginBottom: '2px'
                                    }}
                                    >
                                    {areaType === "" ? '' : `Select a ${areaType} from the dropdown or on the map`}
                                </Typography>
                                <Autocomplete disabled={areaType === ""} options={autocompleteOptions} onChange={handleAreaInstanceChange}>
                                </Autocomplete>
                            </Box>

                            {!data && <Box sx={{alignItems:"center", justifyContent:"center", width:"60%", maxWidth:"350px", alignSelf:"center", marginTop:"80px"}}>
                                    <img src={noDataImg} style={{maxWidth:"100%"}} />
                                    <Typography
                                    variant="h6"
                                    style={{
                                        // fontFamily: "Inter, sans-serif",
                                        fontSize: 16,
                                        fontWeight: "semi-bold",
                                        color: "#4b4b4b",
                                        marginBottom: '2px',
                                        textAlign:"center"
                                    }}>
                                        No Data
                                    </Typography>
                                </Box>}

                            {population != null && density != null && <Box sx={{width:"100%", flexDirection:"row", justifyContent: "flex-start, gap: 2"}}>
                                    <Box sx={{flexDirection: "column", alignItems:"flex-start", gap: 2}}>
                                        <Typography
                                            variant="h6"
                                            style={{
                                                // fontFamily: "Inter, sans-serif",
                                                fontSize: 12,
                                                fontWeight: "semi-bold",
                                                color: "#1b1b1b",
                                                marginBottom: '2px'
                                            }}
                                            >
                                            Population
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            style={{
                                                // fontFamily: "Inter, sans-serif",
                                                fontSize: 28,
                                                fontWeight: "semi-bold",
                                                color: "#4b4b4b",
                                                marginBottom: '2px'
                                            }}
                                            >
                                            {population}
                                        </Typography>
                                    </Box>

                                    <Box sx={{flexDirection: "column", alignItems:"flex-start", gap: 2}}>
                                        <Typography
                                            variant="h6"
                                            style={{
                                                // fontFamily: "Inter, sans-serif",
                                                fontSize: 12,
                                                fontWeight: "semi-bold",
                                                color: "#1b1b1b",
                                                marginBottom: '2px'
                                            }}
                                            >
                                            Density
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            style={{
                                                // fontFamily: "Inter, sans-serif",
                                                fontSize: 12,
                                                fontWeight: "semi-bold",
                                                color: "#424242",
                                                marginBottom: '2px'
                                            }}
                                            >
                                            People per km^2
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            style={{
                                                // fontFamily: "Inter, sans-serif",
                                                fontSize: 28,
                                                fontWeight: "semi-bold",
                                                color: "#4b4b4b",
                                                marginBottom: '2px'
                                            }}
                                            >
                                            {density}
                                        </Typography>
                                    </Box>
                            </Box>}
                        </Stack>
                        <Box
                        sx={{
                            position:"absolute", 
                            display:"flex", 
                            bottom:0, 
                            left:0, 
                            width:"100%", 
                            borderTop: "1px solid grey", 
                            height: { xs:"50px", md:"55px"}, 
                            gap: 2, 
                            justifyContent: "flex-end", 
                            alignItems:"center", 
                            zIndex:10, 
                            boxSizing:"border-box", 
                            px:1,
                            py:1
                        }}
                        >
                            <Button variant="outlined" color="neutral" loading={exportLoading} startDecorator={<FileDownloadOutlinedIcon />}>
                                Export
                            </Button>

                            <Button loading={saveLoading} startDecorator={<SaveIcon />}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )}
                
                {showMap === true && (
                    <Box sx={{display: {xs: "none", md:"block"}, width:"100%"}}>
                        <MapVisualComponent />
                    </Box>
                    
                )}
            </Box>

        </Box>
    )
}

export default Amenities