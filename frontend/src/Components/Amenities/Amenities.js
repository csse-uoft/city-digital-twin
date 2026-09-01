import { useState, useEffect, useReducer, useMemo } from "react";
import { Box, Container, Grid, Paper, Stack, Typography, Tab, Tabs } from "@mui/material";
import { Input, Button, Select, Autocomplete, Option, CircularProgress } from '@mui/joy';
import SaveIcon from '@mui/icons-material/Save';
import MapIcon from '@mui/icons-material/Map';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

import AmenityLocationSelect from './AmenityLocationSelect'
import CompareSelect from './CompareSelect'

import MapVisualComponent from './MapVisualComponent'
import DefaultMap from './DefaultMap'
import { NewDropdown } from "../SearchPageComponents/NewDropdown";

import noDataImg from '../../assets/images/Illustration.png'
import {
  getCurrentAdminTypeURL,
  getSelectedAdminInstancesURLs,
  getSelectedAdminInstancesURLsAndNames,
  getSelectedCompareAdminInstancesURLsAndNames,
  getSelectedAdminInstancesNames,
} from "../../helpers/reducerHelpers";
import {
  fetchAmenityLocations,
  testBackendConnection,
  fetchAmenityData,
  fetchCityAverage,
  fetchCityAverageV2
} from "../../helpers/fetchFunctions";
import ChartPanel from "./Charts/ChartPanel";

const mockAmenityData = { 
	'South Riverdale (70)': {
				'Health':0.7,  // type - walkability score
				'Spiritual':0.2, 
				'Education & childcare':0.8, 
				'Retail & services':0.8, 
				'Communal':0,
                'Cultural':0.3,
                'Recreational': 0.1
				},
    // 'University (79)':      {
	// 			'Health':0.7, 
	// 			'Spiritual':0.2, 
	// 			'Education & Childcare':0.8, 
	// 			'Retail & services':0.8, 
	// 			'Communal':0
	// 		       }
}

const mockAmenityData2 = {
    'South Riverdale (70)': {
				'Health':0.7,  // type - walkability score
				'Spiritual':0.2, 
				'Education & childcare':0.8, 
				'Retail & services':0.8, 
				'Communal':0,
                'Cultural':0.3,
                'Recreational': 0.1
				},
    'University (79)':      {
				'Health':0.7, 
				'Spiritual':0.2, 
				'Education & Childcare':0.8, 
				'Retail & services':0.8, 
				'Communal':0
			       }
}

const mockWalkabilityData = {
    'South Riverdale (70)':{
        "Communal": {
            "walkability": 0.5535714285714286,
            "subtypes": [
                {
                    "subtype": "Library",
                    "walkability": 0.5535714285714286
                }
            ],
            "color": "EC4899"
        },
        "Cultural": {
            "walkability": 0.5535714285714286,
            "subtypes": [
                {
                    "subtype": "Library",
                    "walkability": 0.5535714285714286
                }
            ],
            "color": "92400E"
        },
        "EducationAndChildcare": {
            "walkability": 0.9285714285714286,
            "subtypes": [
                {
                    "subtype": "School",
                    "walkability": 0.9285714285714286
                }
            ],
            "color": "3B82F6"
        },
        "Health": {
            "walkability": 0.9285714285714286,
            "subtypes": [
                {
                    "subtype": "Clinic",
                    "walkability": 0.21428571428571427
                },
                {
                    "subtype": "DoctorsOffice",
                    "walkability": 0.35714285714285715
                },
                {
                    "subtype": "Hospital",
                    "walkability": 0.125
                },
                {
                    "subtype": "Pharmacy",
                    "walkability": 0.9285714285714286
                }
            ],
            "color": "EF4444"
        },
        "ParkService": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "ParkService",
                    "walkability": 1
                }
            ],
            "color": ""
        },
        "PublicTransitService": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "PublicTransitService",
                    "walkability": 1
                }
            ],
            "color": ""
        },
        "RetailAndServices": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "FastFood",
                    "walkability": 0.9821428571428571
                },
                {
                    "subtype": "Greengrocer",
                    "walkability": 0.6607142857142857
                },
                {
                    "subtype": "Restaurant",
                    "walkability": 0.9642857142857143
                },
                {
                    "subtype": "Supermarket",
                    "walkability": 0.8571428571428571
                }
            ],
            "color": "FB923C"
        }
    },
    'North Riverdale (72)':{
        "Communal": {
            "walkability": 0.5535714285714286,
            "subtypes": [
                {
                    "subtype": "Library",
                    "walkability": 0.5535714285714286
                }
            ],
            "color": "EC4899"
        },
        "Cultural": {
            "walkability": 0.5535714285714286,
            "subtypes": [
                {
                    "subtype": "Library",
                    "walkability": 0.5535714285714286
                }
            ],
            "color": "92400E"
        },
        "EducationAndChildcare": {
            "walkability": 0.9285714285714286,
            "subtypes": [
                {
                    "subtype": "School",
                    "walkability": 0.9285714285714286
                }
            ],
            "color": "3B82F6"
        },
        "Health": {
            "walkability": 0.9285714285714286,
            "subtypes": [
                {
                    "subtype": "Clinic",
                    "walkability": 0.21428571428571427
                },
                {
                    "subtype": "DoctorsOffice",
                    "walkability": 0.35714285714285715
                },
                {
                    "subtype": "Hospital",
                    "walkability": 0.125
                },
                {
                    "subtype": "Pharmacy",
                    "walkability": 0.9285714285714286
                }
            ],
            "color": "EF4444"
        },
        "ParkService": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "ParkService",
                    "walkability": 1
                }
            ],
            "color": ""
        },
        "PublicTransitService": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "PublicTransitService",
                    "walkability": 1
                }
            ],
            "color": ""
        },
        "RetailAndServices": {
            "walkability": 1,
            "subtypes": [
                {
                    "subtype": "FastFood",
                    "walkability": 0.9821428571428571
                },
                {
                    "subtype": "Greengrocer",
                    "walkability": 0.6607142857142857
                },
                {
                    "subtype": "Restaurant",
                    "walkability": 0.9642857142857143
                },
                {
                    "subtype": "Supermarket",
                    "walkability": 0.8571428571428571
                }
            ],
            "color": "FB923C"
        }
    }
}

function initializeFilterState (amenities) {
    let state = {}
    Object.entries(amenities).map(([name,data]) => {
        state[name] ??= {showAll: true}
        data?.subtypes?.map((subtype) => {
            state[name][subtype] = {
                show:true
            }
        })
    })
    //console.log('amenity filter state: ',state)
    return state
}  

function initializeChartCategoryParameterState (walkabilityData) {
    const areaNames = Object.keys(walkabilityData)
    const categoryNames = [
        ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    ]
    let obj = {}
    categoryNames.forEach((name) => {
        obj[name] = true
    })
    //console.log('initialized chart category param state: ',obj)
    return obj
}

function initializeChartSubtypeParameterState (walkabilityData) {
    const areaNames = Object.keys(walkabilityData)
    const categoryNames = [
        ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    ]
    let subtypeMap = {}
    categoryNames.forEach((name) => {
        //iterate over the areas 
        let totalSubtypes = []
        areaNames.forEach((area) => {
        const subtypes = walkabilityData[area][name].subtypes
        totalSubtypes = [
            ...new Set([...totalSubtypes, subtypes])
        ]

        })

        const obj = Object.entries(totalSubtypes.map(item => [item, true]))
        subtypeMap[name] = obj
    })
    //console.log('initialized chart subtype param state:', subtypeMap)
    return subtypeMap
}


function CustomTabPanel(props) {
  const { children, value, index, overlayCoords, centerCoords, locationIDKey, instanceName, instanceURL, cityState, filterPanelState, dispatchFilterPanelState, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <MapVisualComponent
                                        overlayCoords={overlayCoords}
                                        centerCoords={centerCoords}
                                        locationIDKey={locationIDKey}
                                        instanceName={instanceName}
                                        instanceURL={instanceURL}
                                        cityState={cityState}
                                        filterPanelState={filterPanelState[locationIDKey]}
                                        dispatchFilterPanelState={dispatchFilterPanelState}
                                          />}
    </div>
  );
}

function formatAmenities(data) {
    const result = {};
    let unnamedCount = 0;

    data.forEach((amenity) => {
        // Determine Amenity name
        let name = amenity.name;
        if (!name) {
        unnamedCount += 1;
        name = `No name ${unnamedCount}`;
        }
        result[name] = {
        coordinates: amenity.coords.coordinates,
        amenityType: amenity.amenityType,
        displayType: amenity.displayType,
        url: amenity.rootURL,
        color: amenity.color,
        };
    });

    return result;
}

const Amenities = ({
    cityURLs,
    setCityURLs,
    adminAreaTypesState,
    cityState,
    dispatchCityState,
    filterPanelState,
    dispatchFilterPanelState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchAdminAreaInstances,
    chartParameterState,
    dispatchChartParameterState,
    chartEditParameterState,
    dispatchChartEditParameterState
}) => {
    const [showSidePanel, setShowSidePanel] = useState(true)

    //loading signals
    const [cityLoading, setCityLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false)
    const [loadingCityAverage, setLoadingCityAverage] = useState(false)
    const [exportLoading, setExportLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [defaultMapLoading, setDefaultMapLoading] = useState(true)


    /*
    * Holds the Radar data scores for different Amenities.
    */
    const [amenityData, setAmenityData] = useState({});

    /*
    * Stores amenity location polygon or lat/lon points as well as amenity type and colour for each a admin area instance.
    */
    const [amenityPolygons, setAmenityPolygons] = useState({});

    const [enrichedAmenityPolygons, setEnrichedAmenityPolygons] = useState([])

    /*
    * Contains the polygons (outlines) for all the admin area instances.
    */
    const [locationIDPolygons, setlocationIDPolygons] = useState({});


    /*
    * Indicates if the program is loading the indicator visualization.
    * Used primarily for showing loading indicators while this is going on.
    */
    const [visLoading, setVisLoading] = useState(false);

    const [population, setPopulation] = useState(null)
    const [density, setDensity] = useState(null)
    const [data, setData] = useState(null)

    const [tabValue, setTabValue] = useState(0);

    //chart panel
    const [currentAreaURI, setCurrentAreaURI] = useState('')
    const [currentCityURI, setCurrentCityURI] = useState('')
    const [currentAreaName, setCurrentAreaName] = useState('')

    

    const areaURIList = useMemo(() => {
        const selectedCompareAdminInstancesURLs = getSelectedCompareAdminInstancesURLsAndNames(
            adminAreaInstancesState
        );
        // console.log('selected admin instance urls: ', selectedCompareAdminInstancesURLs)
        let obj = {}
        selectedCompareAdminInstancesURLs.forEach((item) => {
            obj[item.url] = item.name
        })
        // console.log('asdfs: ',obj)
        return obj
        
    }, [adminAreaInstancesState])

    //area uri list for chart panels


    useEffect(() => {
        //console.log('CURRENT CITY URI: ',currentCityURI)
        //console.log('CURRENT AREA NAME: ',currentAreaName)
        //console.log('CURRENT AREA URI: ', currentAreaURI)
    },[currentCityURI,currentAreaURI,currentAreaName])


    const handleTabChange = (event, newValue) => {
        // //console.log('new tab value: ', newValue)
        setTabValue(newValue);
    };

    const selectInstance = (instanceName) => {
        // //console.log('user selected area instance name: ', instanceName)
        // //console.log('user selected area instance id: ',instanceID)
        //if we update the areaInstancesState that should work
        dispatchAdminAreaInstances({
            type: "SET_SELECTED",
            payload: [instanceName],
        });
    }


    // const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
    const selectedAdminInstancesURLs = useMemo(
    () => getSelectedAdminInstancesURLsAndNames(adminAreaInstancesState),
    [adminAreaInstancesState]
    );

    /**
     * Formats a list of amenity objects into a keyed dictionary by amenity name.
     *
     * If an amenity has no name, it assigns a default name like "No name 1", "No name 2", etc.
     * The output groups each amenity under its name and includes key properties like coordinates, type, display style, and color.
     */


    useEffect(() => {
        // //console.log("Types State updated:", adminAreaTypesState);
        if(Object.keys(cityState).length === 0 || Object.keys(adminAreaInstancesState).length === 0) return
        // console.log('X citystate: ',cityState)
        // console.log('X adminAreaInstances: ',adminAreaInstancesState)
        //check if the city average for the current city is in session storage
        const currentCityAverageWalkability = sessionStorage.getItem(cityState.cityURI)
        // console.log('current city avg walkability: ',currentCityAverageWalkability)
        if (currentCityAverageWalkability === undefined || currentCityAverageWalkability === null) {
            //fetch it and store it
            // console.log('fetching city avg data')
            fetchCityAverageV2(adminAreaInstancesState,cityState)

        }
      }, [adminAreaInstancesState,cityState]);

    useEffect(() => {
        const locationIDfetchAndFormatAmenties = async () => {
            const instancesToFetch = selectedAdminInstancesURLs.filter(
                (instance) => !amenityPolygons[instance.url.split('#')[1]]
            );

            await Promise.all(
                instancesToFetch.map(async (instance) => {
                const locationID = instance.url.split('#')[1];
                try {
                    const rawData = await fetchAmenityLocations(locationID, adminAreaTypesState);
                    const [amenityData, locationIDLocationData] = rawData;

                    setlocationIDPolygons((prev) => ({ ...prev, ...locationIDLocationData }));

                    const formattedAmenities = formatAmenities(amenityData);
                    formattedAmenities.instanceName = instance.name;
                    formattedAmenities.instanceURL = instance.url;

                    // update incrementally — this is the key change
                    setAmenityPolygons((prev) => ({ ...prev, [locationID]: formattedAmenities }));
                } catch (error) {
                    console.error(`Error fetching or formatting amenities for ${locationID}:`, error);
                }
                })
            );
        };
    
        // Call the function to fetch and format Amenties
        // fetchAmenityDataResults(); don't need this??
        locationIDfetchAndFormatAmenties();
      }, [
        cityURLs,
        setCityURLs,
        adminAreaTypesState,
        dispatchAdminAreaTypes,
        adminAreaInstancesState,
        dispatchAdminAreaInstances,
      ]);

    useEffect(() => {
        const selectedIDs = new Set(selectedAdminInstancesURLs.map(i => i.url.split('#')[1]));
        setAmenityPolygons((prev) => {
            const next = {};
            Object.keys(prev).forEach((id) => {
            if (selectedIDs.has(id)) next[id] = prev[id];
            });
            return next;
        });
    }, [selectedAdminInstancesURLs]);

    useEffect(() => {
        if (Object.keys(adminAreaInstancesState).length === 0) return
        //we need to prepare what we need and call a fetch function to get a list of neighborhood area instances of toronto
        // //console.log('ADMIN AREA INSTANCES STATE: ',adminAreaInstancesState)
        //we need to enrich this user friendly identifiers, mainly the instance name
        const enrichedList = Object.keys(adminAreaInstancesState).map((key) => {
            const instanceName = key
            let obj = adminAreaInstancesState[key]
            obj = {...obj, instanceName: instanceName}

            return obj
        })
        // //console.log('enriched list: ', enrichedList)
        setEnrichedAmenityPolygons(enrichedList)
    }, [adminAreaInstancesState])

    useEffect(() => {
        selectedAdminInstancesURLs.forEach((instance) => {
            const baseURI = "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
            const locationIDKey = instance.url.split("#")[1]
            const fullKey = baseURI + locationIDKey;
            const overlayCoords = locationIDPolygons[fullKey]?.coordinates;
            //initialzie the filter panel state
            if (overlayCoords != null && !filterPanelState[locationIDKey]) {
                const initFilterState = initializeFilterState(cityState.amenityCategories);
                dispatchFilterPanelState({
                    type: 'SET_FILTER',
                    payload: {
                        id: locationIDKey,
                        state: initFilterState
                    }
                });
            }
        });
    }, [locationIDPolygons, cityState, selectedAdminInstancesURLs]);

    useEffect(() => {
        const tabCount = Object.keys(selectedAdminInstancesURLs).length;
        if (tabValue >= tabCount) {
            setTabValue(Math.max(tabCount - 1, 0));
        }
    }, [selectedAdminInstancesURLs]);
    // console.log('admin area instance stae: ',adminAreaInstancesState)
    // console.log('amenity polygons keys: ', amenityPolygons)
    // console.log('current area name: ',currentAreaName)
    // console.log('current area uri: ', currentAreaURI)
    // console.log('citystate: ',cityState)
    // console.log('selected admin instance urls: ', selectedAdminInstancesURLs)
    // console.log('cityURI: ', currentCityURI)
    // console.log('admin instances: ', adminAreaInstancesState)
    return (
        <Box sx={{width:"100%",marginRight: 0, marginLeft: 0}}>
            <Box
            sx={{ display: "flex", height: "100dvh", width:"100%" }}>
                    <Box sx={{ display: {xs: showSidePanel ? "block" : "none", md: "block"}, width: {xs:"100%", md:"450px"}, flexShrink: 0, borderRight: {md: '1px solid var(--border-color)'}, position:"relative", boxSizing:"border-box" }}>
                        <Box sx={{height: {xs: 'calc(100% - 50px)', md: 'calc(100% - 55px)' }, overflowY: 'auto'}}>
                        <Stack spacing={2}>

                            <AmenityLocationSelect
                                cityURLs={cityURLs}
                                setCityURLs={setCityURLs}
                                adminAreaTypesState={adminAreaTypesState}
                                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                                adminAreaInstancesState={adminAreaInstancesState}
                                dispatchAdminAreaInstances={dispatchAdminAreaInstances}
                                dispatchCityState={dispatchCityState}
                                updateCurrentCityURI={setCurrentCityURI}
                                updateCurrentAreaURI={setCurrentAreaURI}
                                updateCurrentAreaName={setCurrentAreaName}
                                isGeneratingVisualization={visLoading}
                                />

                            <CompareSelect
                                cityURI={currentCityURI}
                                adminAreaTypesState={adminAreaTypesState}
                                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                                adminAreaInstancesState={adminAreaInstancesState}
                                dispatchAdminAreaInstances={dispatchAdminAreaInstances}
                                // compareAdminAreaInstancesState={compareAdminAreaInstancesState}
                                // dispatchCompareAdminAreaInstances={dispatchCompareAdminAreaInstances}
                                isGeneratingVisualization={visLoading} 
                                areaURIList={areaURIList}
                                chartParameterState={chartParameterState}
                                dispatchChartParameterState={dispatchChartParameterState}
                                chartEditParameterState={chartEditParameterState}
                                dispatchChartEditParameterState={dispatchChartEditParameterState}
                                amenityData={mockAmenityData2}
                                amenityCategories={cityState.amenityCategories}

                            />
                           
                            {selectedAdminInstancesURLs.length === 0  && <Box sx={{alignItems:"center", justifyContent:"center", width:"60%", maxWidth:"350px", alignSelf:"center", marginTop:"80px"}}>
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
                            
                            { //Object.keys(amenityData).length > 0
                                selectedAdminInstancesURLs.length > 0 && cityState != null ? (currentCityURI != '' && currentAreaURI != '' && currentAreaName != '') ? (
                                <ChartPanel
                                    cityURI={currentCityURI}
                                    areaURI={currentAreaURI} 
                                    areaName={currentAreaName}  
                                    areaURIList={{ [currentAreaURI]: currentAreaName }}
                                    amenityCategories={cityState.amenityCategories}
                                    chartParameterState={chartParameterState}
                                    dispatchChartParameterState={dispatchChartParameterState}
                                    chartEditParameterState={chartEditParameterState}
                                    dispatchChartEditParameterState={dispatchChartEditParameterState}
                                    />) : (<Box sx={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}><CircularProgress /></Box>) : <div></div>
                            }

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
                        </Box>
                        <Box
                        sx={{
                            position:"absolute", 
                            display:"flex", 
                            bottom:0, 
                            left:0, 
                            width:"100%", 
                            borderTop: "1px solid var(--border-color)", 
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

                            <Button onClick={()=>setShowSidePanel(false)} sx={{display: {md: "none", xs: "block"}}} size="sm" variant="outlined">Show Map</Button>
                            
                            <Button size="sm" variant="outlined" color="neutral" loading={exportLoading} startDecorator={<FileDownloadOutlinedIcon />}>
                                Export
                            </Button>

                            <Button size="sm" loading={saveLoading} startDecorator={<SaveIcon />}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                {/* )} */}
                
                {/* {showMap === true && ( */}
                    <Box sx={{display: {xs: showSidePanel ? "none" : "block", md:"block"}, width:"100%", height:"100%"}}>
                        <Button variant="outlined" size="sm" onClick={()=>setShowSidePanel(true)} sx={{display: {md:"none", xs:"block"}, position:"fixed", bottom:"10px", left:"10px", zIndex:10000}}>Show Panel</Button>
                        {selectedAdminInstancesURLs.length > 0 ? Object.keys(amenityPolygons).length > 0 && cityState != null ? (
                            <Box>
                            <Box sx={{ borderBottom: 1, borderColor: 'var(--border-color)' }}>
                                {/* <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example" variant="scrollable"
                                sx={{'& .MuiTabs-indicator': {      // the active underline bar
      backgroundColor: 'var(--uoft-blue)',
      height: '3px',
    }}}>
                                    {Object.keys(amenityPolygons).map((locationIDKey,index) => {
                                        const baseURI = "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
                                        const fullKey = baseURI + locationIDKey;
                                        const instanceName = amenityPolygons[locationIDKey].instanceName
                                        //icon={<MapIcon />} iconPosition="start"
                                        return(
                                            <Tab label={instanceName} value={index} color="blue" onClick={()=>{
                                                setCurrentAreaURI(fullKey)
                                                setCurrentAreaName(instanceName)
                                            }}
                                            sx={{textTransform: 'none', '&.Mui-selected': {          // active tab styles
                                                        fontWeight: 'bold',
                                                        color: 'var(--uoft-blue)'
                                                        }}} />
                                        )
                                    })}
                                </Tabs> */}
                                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example" variant="scrollable" sx={{'& .MuiTabs-indicator': {      // the active underline bar
                                    backgroundColor: 'var(--uoft-blue)',
                                    height: '3px',
                                    }}}>
                                {selectedAdminInstancesURLs.map((instance, index) => {
                                    const locationID = instance.url.split('#')[1];
                                    return (
                                    <Tab
                                        key={locationID}
                                        label={instance.name}
                                        value={index}
                                        onClick={() => {
                                        setCurrentAreaURI(instance.url);
                                        setCurrentAreaName(instance.name);
                                        }}
                                        sx={{textTransform: 'none', '&.Mui-selected': {          // active tab styles
                                                        fontWeight: 'bold',
                                                        color: 'var(--uoft-blue)'
                                                        }}}
                                    />
                                    );
                                })}
                                </Tabs>
                            </Box>


                        {/* {Object.keys(amenityPolygons).map((locationIDKey,index) => {
                            const baseURI =
                            "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
                            const fullKey = baseURI + locationIDKey;
                            const locationID = amenityPolygons[locationIDKey];
                            const instanceName = amenityPolygons[locationIDKey].instanceName
                            const instanceURL = amenityPolygons[locationIDKey].instanceURL
                            
                            let overlayCoords = locationIDPolygons[fullKey]?.coordinates;
                            let centerCoords = locationIDPolygons[fullKey]?.centerCoords
                            if (overlayCoords != null) {
                                return(
                                     <CustomTabPanel 
                                        value={tabValue} 
                                        index={index} 
                                        overlayCoords={overlayCoords} 
                                        centerCoords={centerCoords}
                                        locationIDKey={locationIDKey} 
                                        amenities={locationID} 
                                        instanceName={instanceName} 
                                        instanceURL={instanceURL} 
                                        cityState={cityState} 
                                        filterPanelState={filterPanelState} 
                                        dispatchFilterPanelState={dispatchFilterPanelState} 
                                        />
                                )
                            }
                        })} */}

                        {selectedAdminInstancesURLs.map((instance, index) => {
                            const locationID = instance.url.split('#')[1];
                            const fullKey = "http://ontology.eil.utoronto.ca/Toronto/Toronto#" + locationID;
                            const isReady = Boolean(amenityPolygons[locationID]);

                            return (
                                <div role="tabpanel" hidden={tabValue !== index} key={locationID}>
                                {tabValue === index && (
                                    isReady && locationIDPolygons[fullKey] != undefined ? (
                                    <CustomTabPanel
                                        value={tabValue}
                                        index={index}
                                        overlayCoords={locationIDPolygons[fullKey]?.coordinates}
                                        centerCoords={locationIDPolygons[fullKey]?.centerCoords}
                                        locationIDKey={locationID}
                                        instanceName={instance.name}
                                        instanceURL={instance.url}
                                        cityState={cityState}
                                        filterPanelState={filterPanelState}
                                        dispatchFilterPanelState={dispatchFilterPanelState}
                                    />
                                    ) : (
                                    <Box sx={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%'}}>
                                        <CircularProgress />
                                    </Box>
                                    )
                                )}
                                </div>
                            );
                        })}
                        </Box>
                    ) : (<Box sx={{display:"flex",alignItems:"center", justifyContent:'center', width:'100%',height:'100%'}}> <CircularProgress /> </Box>) : (
                        <DefaultMap 
                        instancePolygons={enrichedAmenityPolygons}
                        selectInstance={selectInstance}
                        updateCurrentAreaName={setCurrentAreaName}
                        updateCurrentAreaURI={setCurrentAreaURI}
                        cityState={cityState}
                        />
                    )}
                       
                    </Box>
                    
                {/* )} */}
            </Box>

        </Box>
    )
}

export default Amenities