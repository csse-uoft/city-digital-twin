import { Autocomplete, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import {MapContainer, Marker, Popup, LayerGroup, TileLayer, Polygon, Tooltip} from 'react-leaflet';
import {useMap} from 'react-leaflet/hooks';
import L from 'leaflet';
import MarkerClusterGroup from "react-leaflet-cluster";
import Wkt from 'wicket';
import { DataGrid } from '@mui/x-data-grid';
import MUIDataTable from "mui-datatables";
import { useTheme } from '@mui/material/styles';


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function Dashboard() {
  const theme = useTheme();

  const [years, setYears] = useState([{value1: -1, value2: -1, id: 0}]);
  let options = ['The Godfather', 'Pulp Fiction'];

  const [cities, setCities] = useState([]);
  const [cityURLs, setCityURLs] = useState({});

  const [admin, setAdmin] = useState([]);
  const [adminURLs, setAdminURLs] = useState({});

  const [area, setArea] = useState([]);
  const [areaURLs, setAreaURLs] = useState({});

  const [indicators, setIndicators] = useState([]);
  const [indicatorURLs, setIndicatorURLs] = useState({});
  const [indicatorNames, setIndicatorNames] = useState({});

  const [locationURLs, setLocationURLs] = useState({});

  const [selectedIndicators, setSelectedIndicators] = useState({'0': ''});

  const [indicatorData, setIndicatorData] = useState({});

  const [mapPolygons, setMapPolygons] = useState([]);

  const [showingVisualization, setShowingVisualization] = useState(false);

  const [currentAdminType, setCurrentAdminType] = useState("");
  const [currentAdminInstance, setCurrentAdminInstance] = useState("");

  const [tableColumns, setTableColumns] = useState(["Admin Area Name"]);
  const [tableData, setTableData] = useState([]);


  const fetchCities = async () => {
    const response = await axios.get(
      `http://localhost:3000/api/0`
    );

    response.data.cityNames.forEach((URL, index) => {
      const [, cityName] = URL.split('#'); 
      
      setCityURLs(prevCityURLs => ({
        ...prevCityURLs,
        [cityName]: URL
      }));
      
      setCities([...cities, cityName]);
    })
  }
  
  const fetchAdministration = async (city) => {
    if (city){
      try {
        const response = await axios.post('http://localhost:3000/api/2', {
          cityName: cityURLs[city]
        });
        setAdminURLs({'currCity': city}) //The current city is stored in the adminURL['currCity']
        response.data.adminAreaTypeNames.forEach((URL, index) => {
          const [, adminName] = URL.split('#'); 
        
          setAdminURLs(prevAdminURLs => ({
            ...prevAdminURLs,
            [adminName]: URL
          }));
        
          setAdmin(prevAdmin => [...prevAdmin, adminName]);
        });
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else{
      setAdminURLs({});
      setAdmin([]);
    }
  }

  const fetchIndicators = async (city) => {
    if (city){
      try {
        const response = await axios.post('http://localhost:3000/api/1', {
          cityName: cityURLs[city]
        });
        console.log('response', response.data.indicatorNames);
        response.data.indicatorNames.forEach((URL, index) => {
          const [, indName] = URL.split('#'); 
        
          setIndicatorURLs(prevIndicatorURLs => ({
            ...prevIndicatorURLs,
            [indName]: URL
          }));

          setIndicatorNames(prevIndicatorNames => ({
            ...prevIndicatorNames,
            [URL]: indName
          }));
        
          setIndicators(prevIndicator => [...prevIndicator, indName]);
        });
        console.log('indicators', indicators)
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setIndicatorURLs({});
      setIndicatorNames({});
      setIndicators([]);
    }
  }

  const fetchArea= async (admin) => {
    setAreaURLs({});
    setArea([]);
    if (admin){
      try {
        const response = await axios.post('http://localhost:3000/api/3', {
          cityName: cityURLs[adminURLs['currCity']],
          adminType: adminURLs[admin]
        });
        console.log('admin instances', response.data['adminAreaInstanceNames'])
        response.data['adminAreaInstanceNames'].forEach((Instance, index) => {
          setAreaURLs(prevAreaURLs => ({
            ...prevAreaURLs,
            [Instance['areaName']]: Instance['adminAreaInstance']
          }));
        
          setArea(prevArea => [...prevArea, Instance['areaName']]);
        });
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setAreaURLs({});
      setArea([]);
    }
  }

  const fetchLocations = async admin => {
    setLocationURLs({});
    if (admin) {
      try {
        const response = await axios.post('http://localhost:3000/api/6', {
          cityName: cityURLs[adminURLs['currCity']],
          adminType: adminURLs[admin]
        });
        console.log('admin instances', response.data['adminAreaInstanceNames']);

        const updatedLocationURLs = {...locationURLs};
        response.data['adminAreaInstanceNames'].forEach((Instance, index) => {
          var wkt = new Wkt.Wkt();
          wkt.read(Instance['areaLocation']);

          var flipped = wkt.toJson();

          // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
          // The code requires Lat/Lon, so flip it back.
          flipped.coordinates = flipped.coordinates.map(innerArray => innerArray.map(coords => [coords[1], coords[0]]));
          updatedLocationURLs[Instance['adminAreaInstance']] = flipped;             
        });
        setLocationURLs(updatedLocationURLs);
        console.log("locations", updatedLocationURLs);
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setLocationURLs({});
    }
  }

  const fetchData = async () => {
    setIndicatorData({});

    try {
      await axios.post('http://localhost:3000/api/4', {
        cityName: cityURLs[adminURLs['currCity']],
        adminType: currentAdminType,
        adminInstance: [currentAdminInstance],
        indicatorName: indicatorURLs[selectedIndicators['0']],
        startTime: years[0].value1,
        endTime: years[0].value2
      }).then(response => {
        console.log('final data', response.data['indicatorDataValues']);
        setIndicatorData(response.data['indicatorDataValues']);
      });

      // response.data['indicatorDataValues'].forEach((Instance, index) => {
      //   setIndicatorData(prevIndicatorData => ({
      //     ...prevIndicatorData,
      //     [Object.keys(instance)[0]]: Instance
      //   }));
      //   setAreaURLs(prevAreaURLs => ({
      //     ...prevAreaURLs,
      //     [Instance['areaName']]: Instance['adminAreaInstance']
      //   }));
      
      //   setArea(prevArea => [...prevArea, Instance['areaName']]);
      // });
      
      // setIndicatorData(response.data['indicatorDataValues']);
    } catch (error) {
      console.error('POST Error:', error);
    }
  };

  // useEffect(() => {
    // setMapPolygons([]);

    // const currentAreaNames = Object.fromEntries(Object.entries(areaURLs).map(([key, value]) => [value, key]));

    // const newPolygons = Object.keys(locationURLs).map(key => (
    //     <Polygon key={key} pathOptions={{ color: 'red' }} positions={locationURLs[key].coordinates}>
    //     {console.log(selectedIndicators[0] === "")}
    //     {
            
    //         selectedIndicators[0] === "" ? 
    //             <>
    //                 <Tooltip sticky><strong>{currentAreaNames[key]}</strong> <br/>No indicators selected</Tooltip>
    //                 <Popup><strong>{currentAreaNames[key]}</strong> <br/>No indicators selected</Popup>
    //             </>
    //         :
    //             <>
    //                 <Tooltip sticky>
    //                     <strong>{currentAreaNames[key]}</strong> <br/>
    //                     {selectedIndicators[0]}: <br/>
    //                     10 (2016)
    //                 </Tooltip>
    //                 <Popup>
    //                     <strong>{currentAreaNames[key]}</strong> <br/>
    //                     {selectedIndicators[0]}: <br/>
    //                     10 (2016)
    //                 </Popup>
    //             </>
    //     }
            
    //     </Polygon>
    // ));

    // setMapPolygons(newPolygons);
  // }, [locationURLs,selectedIndicators]);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    // console.log('city url', cityURLs);
    // console.log('admin url', adminURLs);
    console.log('areaurl', areaURLs);
  }, [cityURLs, adminURLs, areaURLs]);

  const handleAddIndicator = () => {
    const newId = Object.keys(selectedIndicators).length;
    const newValue = '';
    
    const newSelectedIndicators = { ...selectedIndicators, [newId]: newValue };
    setSelectedIndicators(newSelectedIndicators);
    
    console.log('add indicator:', newSelectedIndicators);
  };

  const handleAddYears = () => {
    const temp = [...years];
    temp.push({
      value1: -1,
      value2: -1,
      id: years.length
    });
    setYears(temp);
    console.log(temp);
  }

  const handleUpdateYear = (id, startOrEnd, event) => {
    // if (("" + event.target.value).length === 4) {
      var temp = years.slice(0, id);
      if (startOrEnd === "start") {
        temp.push({
          value1: event.target.value,
          value2: years[id].value2,
          id: id
        });
      } else {
        temp.push({
          value1: years[id].value1,
          value2: event.target.value,
          id: id
        });
      }
      temp.push(years.slice(id+1));

      setYears(temp);
    // }
  };

  const handleUpdateIndicators = (id, value) => {
    setSelectedIndicators(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleGenerateVisualization = () => {
    const checkIfInputsFilled = () => {
      return (
        typeof(adminURLs['currCity']) !== 'undefined' &&
        typeof(currentAdminType) === 'string' && currentAdminType !== '' &&
        typeof(currentAdminInstance) === 'string' && currentAdminInstance !== ''  &&
        selectedIndicators['0'] !== '' &&
        years[0].value1 !== -1 &&
        years[0].value1 !== -1
      );
    };

    // if (!showingVisualization && checkIfInputsFilled()) {
      
    // } 

    if (checkIfInputsFilled()) {
      fetchData();

      var yearRange = [];
      for (let i = years[0].value1; i <= years[0].value2; ++i) {
        yearRange.push(i.toString());
      }
      setTableColumns(["Admin Area Name"].concat(yearRange));
      
      setTableData(Object.entries(indicatorData).map((instanceName, data) => (
        [instanceName].concat(Object.entries(data).map((year, value) => value))
      )));

      setMapPolygons([]);

      const currentAreaNames = Object.fromEntries(Object.entries(areaURLs).map(([key, value]) => [value, key]));
      
      console.log("INDICATOR DATA", indicatorData);
      const itemColor = (key) => {
        if (Object.keys(indicatorData).indexOf(key) !== -1) {
          return 'green'; 
        } else {
          return 'red';
        }
      }

      console.log("SIZE: ", Object.keys(locationURLs).length);
      const newPolygons = Object.keys(locationURLs).map(key => (
        <>
        {console.log("KEY:", key)}
        {console.log("COLOR:", itemColor(key))}
        {console.log("POSITION:", locationURLs[key].coordinates)}
        <Polygon key={key} pathOptions={{color: itemColor(key)}} positions={locationURLs[key].coordinates}>
          {
            Object.keys(indicatorData).indexOf(key) === -1 ? 
              <>
                <Tooltip sticky><strong>{currentAreaNames[key]}</strong> <br/>Area was not selected</Tooltip>
                <Popup><strong>{currentAreaNames[key]}</strong> <br/>Area was not selected</Popup>
              </>
            :
              <>
                <Tooltip sticky>
                  <strong>{currentAreaNames[key]}</strong> <br/>
                  {selectedIndicators[0]}:
                  {indicatorData[indicatorURLs[selectedIndicators[0]]].map(([key, value]) => (
                    <>
                      <br/> {value} ({key})
                    </>
                  ))}
                </Tooltip>
                <Popup>
                  <strong>{currentAreaNames[key]}</strong> <br/>
                  {selectedIndicators[0]}: <br/>
                  {indicatorData[indicatorURLs[selectedIndicators[0]]].map(([key, value]) => (
                    <>
                      <br/> {value} ({key})
                    </>
                  ))}
                </Popup>
              </>
          }   
        </Polygon>
        </>
      ));
      setMapPolygons(newPolygons);

      if (!showingVisualization) {
        setShowingVisualization(true);
      }
    } else {
      console.log("Can't generate visualization: missing data");
    }
  }

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
                          fetchAdministration(newValue);
                          fetchIndicators(newValue);
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
                        fetchArea(newValue);
                        fetchLocations(newValue);
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
                        onChange={(event, newValue) => handleUpdateIndicators(parseInt(index), newValue)}
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
                    {/* <Autocomplete
                        disablePortal
                        options={indicators}
                        sx={{ maxWidth: 270, minWidth: 220 }}
                        renderInput={(params) => <TextField {...params} label={`Select Indicator #${1}*`}/>}
                        /> */}
                    <Button variant="outlined" sx={{maxWidth: '270px', height: '56px'}} onClick={() => handleAddIndicator()}><AddIcon /></Button>
                  </Stack>
                </Box>
              </Grid>
              <Grid xs='12' md='6'>
                <Stack spacing={5} sx={{}}>
                  {years.map(({ id, value1, value2 }) => (
                    <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                      <TextField type="number" id="outlined-basic" value={value1} label={`Starting Year #${id + 1}*`} onChange={(event) => handleUpdateYear(id, "start", event)} variant="outlined" sx={{paddingRight: '10px', width: '130px'}}/>
                      <TextField type="number" id="outlined-basic" value={value2} label={`Ending Year #${id + 1}*`} onChange={(event) => handleUpdateYear(id, "end", event)} variant="outlined" sx={{width: '130px'}}/>
                    </Box>
                  ))}
                  <Box sx={{display: 'flex', justifyContent: 'center'}}>
                    {(
                      (years.length < indicators.length)
                      ? 
                      <Button variant="outlined" sx={{width: '270px', height: '56px'}} onClick={() => handleAddYears()}><AddIcon /></Button>
                      :
                      <Button variant="outlined" sx={{width: '270px', height: '56px'}} onClick={() => handleAddYears()}disabled><AddIcon /></Button>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
          <Button color="primary" variant="contained" sx={{width: '220px', height: '50px', borderRadius: '15px', border: '1px solid black'}} onClick={() => handleGenerateVisualization()}>Generate Visualization</Button>
        </Box>
      </Stack>

      {showingVisualization && 
        <Stack spacing={3}>
          <MapContainer
            className="map"
            center={[43.651070, -79.347015]}
            zoom={10}
            minZoom={3}
            maxZoom={19}
            maxBounds={[[-85.06, -180], [85.06, 180]]}
            scrollWheelZoom={true}>
            <TileLayer
              attribution=' &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapPolygons}
          </MapContainer>
          {/*
          <DataGrid 
            rows={tableData}
            columns={tableColumns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10,
                },
              },
            }}
            pageSizeOptions={[5]}
            checkboxSelection
            disableRowSelectionOnClick
          />
          */}
{/* 
          <MUIDataTable
            title={selectedIndicators[0]}
            columns={tableColumns}
            data={tableData}
            options={{
              filterType: 'checkbox'
            }}
            pagination
          /> */}
        </Stack>
      }
    </Container>
  );
}

export default Dashboard;