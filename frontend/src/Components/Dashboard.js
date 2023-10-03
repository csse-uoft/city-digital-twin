import { Autocomplete, Box, Button, Container, Grid, Paper, Stack, TextField, Typography, ThemeProvider, createTheme } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import {MapContainer, Marker, Popup, LayerGroup, TileLayer, Polygon, Tooltip} from 'react-leaflet';
import {useMap} from 'react-leaflet/hooks';
import L from 'leaflet';
import Wkt from 'wicket';
import MUIDataTable from "mui-datatables";
import { red } from "@mui/material/colors";
import { Legend, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, PieChart, Pie } from 'recharts';
import { fetchCities, fetchAdministration, fetchIndicators, fetchArea, fetchLocations, handleUpdateIndicators, handleAddIndicator, handleAddYears, handleUpdateYear, handleGenerateVisualization } from "./helper_functions";
import MapView from "./MapView";
import IndicatorTable from "./Table";
import ActivePie from "./ActivePie";



delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Dashboard() {
  const defaultTheme = createTheme();

  const [years, setYears] = useState([{value1: -1, value2: -1, id: 0}]);

  const [cities, setCities] = useState([]);
  const [cityURLs, setCityURLs] = useState({});

  const [admin, setAdmin] = useState([]);
  const [adminURLs, setAdminURLs] = useState({});

  const [area, setArea] = useState([]);
  const [areaURLs, setAreaURLs] = useState({});

  const [indicators, setIndicators] = useState([]);

  const [indicatorURLs, setIndicatorURLs] = useState({});

  const [locationURLs, setLocationURLs] = useState({});

  const [selectedIndicators, setSelectedIndicators] = useState({'0': ''});

  const [indicatorData, setIndicatorData] = useState({});

  const [mapPolygons, setMapPolygons] = useState({});

  const [showingVisualization, setShowingVisualization] = useState(false);
  const [beginGeneration, setBeginGeneration] = useState(false);

  const [currentAdminType, setCurrentAdminType] = useState("");
  const [currentAdminInstance, setCurrentAdminInstance] = useState("");

  const [tableColumns, setTableColumns] = useState({});
  const [tableData, setTableData] = useState({});

  const [chartData, setChartData] = useState({});

  const [showVisError, setShowVisError] = useState(false);

  

  class Table {
    constructor(columns, data) {
      this.columns = columns;
      this.data = data;
    }
  }


  // Upon initial page load, fetch list of cities
  useEffect(() => {
    fetchCities(setCityURLs, setCities, cities);
  }, []);

  useEffect(() => {
    // console.log('city url', cityURLs);
    // console.log('admin url', adminURLs);
    console.log('areaurl', areaURLs);
  }, [cityURLs, adminURLs, areaURLs]);

  
  

  useEffect(() => {
    // Also checks if number of keys in indicatorData is equal to length of selectedIndicators - will indicate if completely done previous step
    if (beginGeneration && Object.keys(indicatorData).length === Object.keys(selectedIndicators).length) {
      const currentAreaNames = Object.fromEntries(Object.entries(areaURLs).map(([key, value]) => [value, key]));
      const currentIndicatorNames = Object.fromEntries(Object.entries(indicatorURLs).map(([key, value]) => [value, key]));
      const indicatorIndices = Object.fromEntries(Object.entries(selectedIndicators).map(([key, value]) => [value, key]));

      setMapPolygons({});
      setTableColumns({});
      setTableData({});
      setChartData({});

      Object.keys(indicatorData).forEach(indicator => {
        var yearRange = [];
        const ind = parseInt(indicatorIndices[currentIndicatorNames[indicator]]);
        for (let i = years[ind].value1; i <= years[ind].value2; ++i) {
          yearRange.push(i.toString());
        }

        // Set table information: column names and data
        setTableColumns(prevColumns => ({
          ...prevColumns,
          [indicator]: ["Admin Area Name"].concat(yearRange)
        }));


        setTableData(prevData => ({
          ...prevData,
          [indicator]: Object.entries(indicatorData[indicator]).map(([instanceURL, data]) => (
            [currentAreaNames[instanceURL]].concat(Object.entries(data).map(([year, value]) => value))
          ))
        }));

        // Set chart information
        const tempChartData = yearRange.map(year => ({
          name: year,
          value: indicatorData[indicator][currentAdminInstance][year]
        }));
        setChartData(oldData => ({
          ...oldData,
          [indicator]: tempChartData
        }));
        
        // Set map information

        const itemColor = (key) => {
          if (Object.keys(indicatorData[indicator]).indexOf(key) !== -1) {
            return 'green'; 
          } else {
            return 'red';
          }
        }


        const newPolygons = Object.keys(locationURLs).map(key => (
          <Polygon key={key} pathOptions={{color: itemColor(key)}} positions={locationURLs[key].coordinates}>
            {
              Object.keys(indicatorData[indicator]).indexOf(key) === -1 ? 
                <>
                  <Tooltip sticky><strong>{currentAreaNames[key]}</strong> <br/>Area was not selected</Tooltip>
                  <Popup><strong>{currentAreaNames[key]}</strong> <br/>Area was not selected</Popup>
                </>
              :
                <>
                  <Tooltip sticky>
                    <strong>{currentAreaNames[key]}</strong> <br/>
                    {selectedIndicators[ind]}:<br/>
                    {Object.entries(indicatorData[indicator][currentAdminInstance]).map(([year, value]) => (
                      <div key={currentAreaNames[key]}>
                        {value} ({year})
                      </div>
                    ))}
                  </Tooltip>
                  <Popup>
                    <strong>{currentAreaNames[key]}</strong> <br/>
                    {selectedIndicators[ind]}:<br/>
                    {Object.entries(indicatorData[indicator][currentAdminInstance]).map(([year, value]) => (
                      <div key={currentAreaNames[key]}>
                        {value} ({year})
                      </div>
                    ))}
                  </Popup>
                </>
            }   
          </Polygon>
        ));
        setMapPolygons(oldPolygons => ({
          ...oldPolygons,
          [indicator]: {polygons:newPolygons, index:ind}
        }));
      });

      if (!showingVisualization) {
        setShowingVisualization(true);
      }
      setBeginGeneration(false);
    }
  }, [indicatorData]); 

  return (
    <Container maxWidth='lg' sx={{marginTop: '30px', paddingBottom: '100px'}}>
      {/* Input Form */}
      <Stack spacing={3}>
        <Box sx={{marginBottom: '50px'}}>
          <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px', marginBottom: '20px'}}>
            <Typography variant="h5">location & area type</Typography>
          </Box>
          <Paper sx={{paddingBottom: '50px'}}>
            <Grid container>
              <Grid xs='12' md='6'>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                  <Stack spacing={5}>
                    <Autocomplete
                      disablePortal
                      id="city-input"
                      onChange={
                        (event, newValue) => {
                          fetchAdministration(newValue, cityURLs, setAdminURLs, setAdmin);
                          fetchIndicators(newValue, cityURLs, setIndicatorURLs, setIndicators, indicators);
                        }
                      }
                      options={cities}
                      sx={{ maxWidth: 270, minWidth: 220 }}
                      renderInput={(params) => <TextField {...params} label="Select City:*" />}
                    />
                  </Stack>
                </Box>
              </Grid>
          
              <Grid xs='12' md='6'>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px',}}>
                  <Stack spacing={5}>
                    <Autocomplete
                      disablePortal
                      onChange={(event, newValue) => {
                        fetchArea(newValue, cityURLs, adminURLs, setAreaURLs, setArea);
                        fetchLocations(newValue, cityURLs, adminURLs, locationURLs, setLocationURLs);
                        setCurrentAdminType(adminURLs[newValue]);
                      }}
                      options={admin}
                      sx={{ maxWidth: 270, minWidth: 220 }}
                      renderInput={(params) => <TextField {...params} label="Select Administrative Type:*" />}
                    />
                    <Autocomplete
                      disablePortal
                      options={area}
                      sx={{ maxWidth: 270, minWidth: 220 }}
                      onChange={(event, newValue) => {
                        setCurrentAdminInstance(areaURLs[newValue]);
                        console.log("NEW ADMIN INSTANCE:", areaURLs[newValue]);
                      }}
                      renderInput={(params) => <TextField {...params} label="Specific Area:" />}
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Box>
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
          <Typography variant="h5">Indicator Information</Typography>
        </Box>
          <Paper sx={{paddingBottom: '50px'}}>
            <Grid container>
              <Grid xs='12' md='6'>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                  <Stack spacing={5}>
                    {Object.entries(selectedIndicators).map(([ index, value ]) => (
                      <Autocomplete
                        disablePortal
                        onChange={(event, newValue) => handleUpdateIndicators(parseInt(index), newValue, setSelectedIndicators)}
                        key={index}
                        options={indicators}
                        sx={{ maxWidth: 270, minWidth: 220}}
                        renderInput={(params) => (
                          <TextField 
                            value={value} {...params} 
                            label={`Select Indicator #${parseInt(index) + 1}*`} 
                          />
                        )}
                      /> 
                    ))} 
                    <Button variant="outlined" sx={{maxWidth: '270px', height: '56px'}} 
                            onClick={() => {
                              handleAddIndicator(selectedIndicators, setSelectedIndicators);
                              handleAddYears(years, setYears);
                            }}
                    >
                      <AddIcon />
                    </Button>
                  </Stack>
                </Box>
              </Grid>
              <Grid xs='12' md='6'>
                <Stack spacing={5} sx={{}}>
                  {years.map(({ id, value1, value2 }) => (
                    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                      <TextField type="number" id="outlined-basic" value={value1} label={`Starting Year #${id + 1}*`} onChange={(event) => handleUpdateYear(id, "start", event, years, setYears)} variant="outlined" sx={{paddingRight: '10px', width: '130px'}}/>
                      <TextField type="number" id="outlined-basic" value={value2} label={`Ending Year #${id + 1}*`} onChange={(event) => handleUpdateYear(id, "end", event, years, setYears)} variant="outlined" sx={{width: '130px'}}/>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
          <Button color="primary" variant="contained" sx={{width: '220px', height: '50px', borderRadius: '15px', border: '1px solid black'}} 
          onClick={() => handleGenerateVisualization(years, cityURLs, adminURLs, indicatorURLs, selectedIndicators, currentAdminType, currentAdminInstance, showVisError, setMapPolygons, setShowVisError, setIndicatorData, setBeginGeneration, setShowingVisualization)}>Generate Visualization</Button>
        </Box>
      </Stack>

      {showVisError &&
        <Typography variant="h6" align="center" sx={{color:"red"}}>ERROR: Could not generate visualization due to missing/improper data.<br/>Please check form inputs.</Typography>  
      }

      {showingVisualization && 
        <Stack spacing={3}>
          <Button variant="outlined" size="small" sx={{width:'200px'}} onClick={() => setShowingVisualization(false)}>Close</Button>
          
          {Object.keys(mapPolygons).map(indicator => (
            <Paper sx={{padding:'20px', paddingBottom: '50px'}}>
              <Stack spacing={3}>
                <Typography variant="h4" align="center" sx={{}}>{selectedIndicators[mapPolygons[indicator].index]}</Typography>  
                <IndicatorTable defaultTheme = {defaultTheme} selectedIndicators = {selectedIndicators} mapPolygons = {mapPolygons} indicator = {indicator} tableColumns = {tableColumns} tableData = {tableData}/>

                {/* Custom theme breaks MUIDataTable somehow, so override back to default theme */}
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                      <Autocomplete
                        disablePortal
                        id="change-graph"
                        options={['Bar', 'Pie', 'Line']}
                        sx={{ maxWidth: 260, minWidth: 190 }}
                        renderInput={(params) => <TextField {...params} label="Select Graph 1 Type" />}
                      />
                      <Box sx={{margin: '20px'}}></Box>
                      <Autocomplete
                        disablePortal
                        id="change-graph"
                        options={['Bar', 'Pie', 'Line']}
                        sx={{ maxWidth: 260, minWidth: 190 }}
                        renderInput={(params) => <TextField {...params} label="Select Graph 2 Type" />}
                      />
                    </Box>
                    
                <Grid container >
                  
                  <Grid sm='6'>
                    <Box sx={{height: '100px'}}>
                      <MapView mapPolygons = {mapPolygons} indicator = {indicator} />
                    </Box>

                  </Grid>
                  <Grid sm='6'>

                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData[indicator]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip/>
                      </LineChart>
                    </ResponsiveContainer>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>

                      <ActivePie data={chartData[indicator]}></ActivePie>
                    </Box>
                    {/* <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={chartData[indicator]} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer> */}
                  </Grid>


                  




                </Grid>
              </Stack>
            </Paper>

            
          ))}
        </Stack>
      }
    </Container>
  );
}

export default Dashboard;