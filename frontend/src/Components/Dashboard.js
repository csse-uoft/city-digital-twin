import { Autocomplete, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
    const [indicators, setIndicators] = useState([{value: '', id: 0}]);
    const [years, setYears] = useState([{value: '', id: 0}]);
    let options = ['The Godfather', 'Pulp Fiction'];

    const [cities, setCities] = useState([]);
    const [cityURLs, setCityURLs] = useState({});

    const [admin, setAdmin] = useState([]);
    const [adminURLs, setAdminURLs] = useState({});

    const [area, setArea] = useState([]);
    const [areaURLs, setAreaURLs] = useState({});


    

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
                setAdminURLs({'currCity': city})
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
        } else{
            setAreaURLs({});
            setArea([]);
        }
    }

    useEffect(() => {
        fetchCities();
        
      }, []);
      useEffect(() => {
        // console.log('city url', cityURLs);
        // console.log('admin url', adminURLs);
        console.log('areaurl', areaURLs);
    }, [cityURLs, adminURLs, areaURLs]);




    const handleAddIndicator = () => {
        const temp = [...indicators];
        temp.push({
            value: '',
            id: indicators.length
        });
        setIndicators(temp);
        console.log(temp);
    }

    const handleAddYears = () => {
        
        const temp = [...years];
        temp.push({
            value1: '',
            value2: '',
            id: years.length
        });
        setYears(temp);
        console.log(temp);

        
        
    }
    const handleUpdateIndicators = (id, value) => {
        const temp = [...indicators];
        const variableToUpdate = temp.find((variable) => variable.id === id);
        variableToUpdate[value] = value;
        setIndicators({ temp });
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
                                            onChange={(event, newValue) => fetchAdministration(newValue)}
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
                                            onChange={(event, newValue) => fetchArea(newValue)}
                                            options={admin}
                                            sx={{ maxWidth: 270, minWidth: 220 }}
                                            renderInput={(params) => <TextField {...params} label="Select Administrative Type:*" />}
                                            />
                                        <Autocomplete
                                            disablePortal
                                            options={area}
                                            sx={{ maxWidth: 270, minWidth: 220 }}
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
                                        {indicators.map(({ id, value }) => (
                                            <Autocomplete
                                                disablePortal
                                                key={id}
                                                options={options}
                                                sx={{ maxWidth: 270, minWidth: 220}}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        value={value} {...params} label={`Select Indicator #${id + 1}*`} 


                                                    />)}
                                                /> 
                                        ))}
                                        <Button variant="outlined" sx={{maxWidth: '270px', height: '56px'}} onClick={() => handleAddIndicator()}><AddIcon /></Button>
                                    </Stack>
                                </Box>
                                
                            </Grid>
                            <Grid xs='12' md='6'>
                                <Stack spacing={5} sx={{}}>
                                    {years.map(({ id, value1, value2 }) => (
                                        <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                                            
                                                <TextField id="outlined-basic" label={`Starting Year #${id + 1}*`} variant="outlined" sx={{paddingRight: '10px', width: '130px'}}/>
                                                <TextField id="outlined-basic" label={`Ending Year #${id + 1}*`} variant="outlined" sx={{width: '130px'}}/>
                                                
                                            
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
                        <Button color="primary" variant="contained" sx={{width: '220px', height: '50px', borderRadius: '15px', border: '1px solid black'}}>Generate Visualization</Button>
                    </Box>
            </Stack>
        </Container>
    );
}

export default Dashboard;