import { useState, useEffect, useReducer } from "react";
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
  getSelectedAdminInstancesNames,
} from "../../helpers/reducerHelpers";
import {
  fetchAmenityLocations,
  testBackendConnection,
  fetchAmenityData,
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
    console.log('amenity filter state: ',state)
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
    console.log('initialized chart category param state: ',obj)
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
    console.log('initialized chart subtype param state:', subtypeMap)
    return subtypeMap
}


function CustomTabPanel(props) {
  const { children, value, index, overlayCoords, locationIDKey, instanceName, instanceURL, amenities, cityState, filterPanelState, dispatchFilterPanelState, ...other } = props;

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
                                        locationIDKey={locationIDKey}
                                        instanceName={instanceName}
                                        instanceURL={instanceURL}
                                        cityState={cityState}
                                        amenities={amenities}
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
    chartCategoryParameterState,
    dispatchChartCategoryParameterState,
    chartSubtypeParameterState,
    dispatchChartSubtypeParameterState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchAdminAreaInstances,
    dispatchCompareAdminAreaInstances,
    chartParameterState,
    dispatchChartParameterState,
    chartEditParameterState,
    dispatchChartEditParameterState
}) => {
    const [showSidePanel, setShowSidePanel] = useState(true)

    //loading signals
    const [cityLoading, setCityLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false)
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
    * The time ranges being considered for the indicators.
    */
    const [years, setYears] = useState([{ value1: 0, value2: 0, id: 0 }]);

    /*
    * Whether the visualization generation functions should activate.
    * True if the program is ready for the visualization to generate, false otherwise.
    */
    const [beginGeneration, setBeginGeneration] = useState(false);

    /*
    * Indicator names mapped to their unique URIs.
    */
    const [indicatorURLs, setIndicatorURLs] = useState({});

    /*
    * The names of the indicators that are currently selected from each dropdown.
    */
    const [selectedIndicators, setSelectedIndicators] = useState({ 0: "" });

    /*
    * The data for each selected indicator.
    */
    const [indicatorData, setIndicatorData] = useState({});

    /*
    * The polygons used to draw the administrative area instances on the map.
    */
    const [mapPolygons, setMapPolygons] = useState({});

    /*
    * Indicates if the program is loading the indicator visualization.
    * Used primarily for showing loading indicators while this is going on.
    */
    const [visLoading, setVisLoading] = useState(false);

    const [population, setPopulation] = useState(null)
    const [density, setDensity] = useState(null)
    const [data, setData] = useState(null)

    const [tabValue, setTabValue] = useState(0);
    const [openComparisonModal, setOpenComparisonModal] = useState(false)

    //chart panel
    const [currentAreaURI, setCurrentAreaURI] = useState('http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood70')
    const [currentCityURI, setCurrentCityURI] = useState('http://ontology.eil.utoronto.ca/Toronto/Toronto#toronto')
    const [currentAreaName, setCurrentAreaName] = useState('South Parkdale (70)')


    const handleTabChange = (event, newValue) => {
        // console.log('new tab value: ', newValue)
        setTabValue(newValue);
    };

    const selectInstance = (instanceName) => {
        // console.log('user selected area instance name: ', instanceName)
        // console.log('user selected area instance id: ',instanceID)
        //if we update the areaInstancesState that should work
        dispatchAdminAreaInstances({
            type: "SET_SELECTED",
            payload: [instanceName],
        });
    }


    const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
    const selectedAdminInstancesURLs = getSelectedAdminInstancesURLsAndNames(
        adminAreaInstancesState
    );
    // console.log('admin area instance state: ', adminAreaInstancesState)

    // const handleCityChange = (event) => {
    //     if (!event?.target?.value) return
    //     console.log('user selected city: ', event.target.value)
    //     setCity(event.target.value)
    // }

    // const handleAreaTypeChange = (event) => {
    //     if (!event?.target?.value) return
    //     console.log('user selected area type: ', event.target.value)
    //     setAreaType(event.target.value)
    // }

    // const handleAreaInstanceChange = (event) => {
    //     if (!event?.target?.value) return
    //     console.log('user selected area instance', event.target.value)
    //     setAreaInstance(event.target.value)
    // }

    /**
     * Formats a list of amenity objects into a keyed dictionary by amenity name.
     *
     * If an amenity has no name, it assigns a default name like "No name 1", "No name 2", etc.
     * The output groups each amenity under its name and includes key properties like coordinates, type, display style, and color.
     */


    useEffect(() => {
        // console.log("Types State updated:", adminAreaTypesState);
      }, [adminAreaTypesState]);

    useEffect(() => {
        // console.log("Current Admin Type", currentAdminType);
        // console.log("Current City", cityURLs);
        // console.log("Print Admin Area instance states", adminAreaInstancesState);
    
        /*
         * Fetches the amenity scores for the radar graph.
         */
        const fetchAmenityDataResults = async () => {
          // update this if we want to query score for \
          var adminType = "";
          if (currentAdminType) {
            adminType = currentAdminType.split("#")[1];
          }
    
          let amenityDataResults = {}; // Store amenity data by area
          try {
            const adminNames = getSelectedAdminInstancesNames(
              adminAreaInstancesState
            );
            // console.log('ADMIN NAMES: ',adminNames)
            const data = await fetchAmenityData(adminType);
            // console.log('DATA: ',data)
            adminNames.forEach((name) => {
              const amenitiesForArea = data.data.filter((obj) => obj.name === name);
    
              if (amenitiesForArea.length > 0) {
                amenitiesForArea.forEach(({ type, value }) => {
                  const amenityType = type.split("#").pop();
    
                  if (!amenityDataResults[name]) {
                    amenityDataResults[name] = {};
                  }
                  amenityDataResults[name][amenityType] =
                    parseFloat(value).toFixed(2);
                });
              }
            });
            console.log('amenityDataResults: ',amenityDataResults)
            setAmenityData(amenityDataResults);
          } catch (error) {
            console.error("Error fetching amenity data:", error);
          }
        };
    
        /*
         * Fetches the admin instance outlines (polygons) as well as the amenity locations
         */
        const locationIDfetchAndFormatAmenties = async () => {
          // Initialize an empty object to store all the Amenties
          setLoading(true);
          let newAmenityPolygons = {};
    
          for (const instance of selectedAdminInstancesURLs) {
            console.log('OOOOOO: ', instance)
            // Extract the location_id part from the URL
            const locationID = instance.url.split("#")[1];
            const instanceName = instance.name
    
            try {
              // Fetch the amenity locations for the current location_id
              const rawData = await fetchAmenityLocations(
                locationID,
                adminAreaTypesState
              );
    
              const amenityData = rawData[0];
            //   console.log('amenity data: ', amenityData)
              const locationIDLocationData = rawData[1];
              setlocationIDPolygons(locationIDLocationData);
              // Format the fetched Amenties using formatAmenties
              const formattedAmenities = formatAmenities(amenityData);
            //   console.log('formattedAmenities: ', formattedAmenities)
              formattedAmenities.instanceName = instanceName
              formattedAmenities.instanceURL = instance.url
    
              // Add the formatted Amenties to the newAmenityPolygons object
              newAmenityPolygons[locationID] = formattedAmenities;

            } catch (error) {
              console.error(
                `Error fetching or formatting Amenties for ${locationID}:`,
                error
              );
            }
          }
    
          // Once all Amenties are fetched and formatted, update the state
          setLoading(false); // Data is ready, stop loading
        //   console.log('new amenity polygons: ', newAmenityPolygons)
          setAmenityPolygons(newAmenityPolygons);
        };
    
        // Call the function to fetch and format Amenties
        fetchAmenityDataResults();
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
        if (Object.keys(adminAreaInstancesState).length === 0) return
        //we need to prepare what we need and call a fetch function to get a list of neighborhood area instances of toronto
        // console.log('ADMIN AREA INSTANCES STATE: ',adminAreaInstancesState)
        //we need to enrich this user friendly identifiers, mainly the instance name
        const enrichedList = Object.keys(adminAreaInstancesState).map((key) => {
            const instanceName = key
            let obj = adminAreaInstancesState[key]
            obj = {...obj, instanceName: instanceName}

            return obj
        })
        // console.log('enriched list: ', enrichedList)
        setEnrichedAmenityPolygons(enrichedList)
    }, [adminAreaInstancesState])

    useEffect(() => {
        Object.keys(amenityPolygons).forEach((locationIDKey) => {
            const baseURI = "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
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
            //initialize the chart category parameter state
            // if (overlayCoords != null && !chartCategoryParameterState[locationIDKey]) {
            //     const initChartCategoryParamState = initializeChartCategoryParameterState(cityState.amenityCategories);
            //     dispatchChartCategoryParameterState({
            //         type: 'SET_PARAMETER',
            //         payload: {
            //             id: locationIDKey,
            //             state: initChartCategoryParamState
            //         }
            //     });
            // }
            //initialize the chart subtype parameter state
            // if (overlayCoords != null && !chartSubtypeParameterState[locationIDKey]) {
            //     const initChartSubtypeParamState = initializeChartSubtypeParameterState(cityState.amenityCategories);
            //     dispatchChartSubtypeParameterState({
            //         type: 'SET_PARAMETER',
            //         payload: {
            //             id: locationIDKey,
            //             state: initChartSubtypeParamState
            //         }
            //     });
            // }
        });
    }, [amenityPolygons, locationIDPolygons, cityState, selectedAdminInstancesURLs]);

    useEffect(() => {
        const tabCount = Object.keys(amenityPolygons).length;
        if (tabValue >= tabCount) {
            setTabValue(Math.max(tabCount - 1, 0));
        }
    }, [amenityPolygons]);

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
                                isGeneratingVisualization={visLoading}
                                />

                            <CompareSelect
                                cityURLs={cityURLs}
                                setCityURLs={setCityURLs}
                                adminAreaTypesState={adminAreaTypesState}
                                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                                adminAreaInstancesState={adminAreaInstancesState}
                                dispatchCompareAdminAreaInstances={dispatchCompareAdminAreaInstances}
                                isGeneratingVisualization={visLoading} 
                                amenityData={mockAmenityData2}

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
                                selectedAdminInstancesURLs.length && cityState != null > 0 ? (currentCityURI != '' && currentAreaURI != '' && currentAreaName != '') ? (
                                <ChartPanel
                                    cityURI={currentCityURI}
                                    areaURI={currentAreaURI} 
                                    areaName={currentAreaName}  
                                    chartCategoryParameterState={chartCategoryParameterState}
                                    dispatchChartCategoryParameterState={dispatchChartCategoryParameterState}
                                    chartSubtypeParameterState={chartSubtypeParameterState}
                                    dispatchChartSubtypeParameterState={dispatchChartSubtypeParameterState}
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
                        {selectedAdminInstancesURLs.length > 0 ? Object.keys(amenityPolygons).length && cityState != null > 0 ? (
                            <Box>
                            <Box sx={{ borderBottom: 1, borderColor: 'var(--border-color)' }}>
                                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example" variant="scrollable"
                                sx={{'& .MuiTabs-indicator': {      // the active underline bar
      backgroundColor: 'var(--uoft-blue)',
      height: '3px',
    }}}>
                                    {Object.keys(amenityPolygons).map((locationIDKey,index) => {
                                        const instanceName = amenityPolygons[locationIDKey].instanceName
                                        //icon={<MapIcon />} iconPosition="start"
                                        return(
                                            <Tab label={instanceName} value={index} color="blue"
                                            sx={{textTransform: 'none', '&.Mui-selected': {          // active tab styles
                                                        fontWeight: 'bold',
                                                        color: 'var(--uoft-blue)'
                                                        }}} />
                                        )
                                    })}
                                </Tabs>
                            </Box>
                        {Object.keys(amenityPolygons).map((locationIDKey,index) => {
                            const baseURI =
                            "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
                            const fullKey = baseURI + locationIDKey;
                            const locationID = amenityPolygons[locationIDKey];
                            const instanceName = amenityPolygons[locationIDKey].instanceName
                            const instanceURL = amenityPolygons[locationIDKey].instanceURL
                            // console.log('AREA INSTANCE: ', amenityPolygons[locationIDKey])
                            // console.log('AMENITIES: ', locationID)
                            // console.log('test location: ', locationIDPolygons[fullKey])
                            let overlayCoords = locationIDPolygons[fullKey]?.coordinates;
                            if (overlayCoords != null) {
                                //dispatch the filter state here
                                // const initFilterState = initializeFilterState(cityState.amenityCategories)
                                // dispatchFilterPanelState({
                                //     type:'SET_FILTER',
                                //     payload: {
                                //         id: locationIDKey,
                                //         state: initFilterState
                                //     }
                                // })
                                //create the panel
                                return(
                                     <CustomTabPanel 
                                        value={tabValue} 
                                        index={index} 
                                        overlayCoords={overlayCoords} 
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
                        })}
                        </Box>
                    ) : (<Box sx={{display:"flex",alignItems:"center", justifyContent:'center', width:'100%',height:'100%'}}> <CircularProgress /> </Box>) : (
                        <DefaultMap 
                        instancePolygons={enrichedAmenityPolygons}
                        selectInstance={selectInstance}
                        cityState={cityState}
                        />
                    )
                        }
                       
                    </Box>
                    
                {/* )} */}
            </Box>

        </Box>
    )
}

export default Amenities