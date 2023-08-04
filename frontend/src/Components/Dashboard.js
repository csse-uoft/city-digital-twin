import { Autocomplete, Box, Button, Container, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";

function Dashboard() {
    const [indicators, setIndicators] = useState([{value: '', id: 0}]);
    const options = ['The Godfather', 'Pulp Fiction'];

    const handleAddIndicator = () => {
        const temp = [...indicators];
        temp.push({
            value: '',
            id: indicators.length
        });
        setIndicators(temp);
        console.log(temp);
    }
    const handleUpdateIndicators = (id, value) => {
        const temp = [...indicators];
        const variableToUpdate = temp.find((variable) => variable.id === id);
        variableToUpdate[value] = value;
        setIndicators({ temp });
    }

    return (
        <Container maxWidth='lg' sx={{marginTop: '30px'}}>
            {/* Input Form */}
            <Paper sx={{paddingBottom: '20px'}}>
                <Grid container>
                    
                    <Grid sm='12' md='3'>
                        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>

                        
                            <Stack spacing={5}>
                                {indicators.map(({ id, value }) => (
                                    <Autocomplete
                                        disablePortal
                                        key={id}
                                        options={options}
                                        sx={{ width: 270 }}
                                        renderInput={(params) => (
                                            <TextField 
                                                value={value} {...params} label={`Select Indicator #${id + 1}*`} 


                                            />)}
                                        /> 
                                ))}
                                <Button variant="outlined" sx={{width: '270px', height: '56px'}} onClick={() => handleAddIndicator()}><AddIcon /></Button>
                            </Stack>
                        </Box>
                        
                    </Grid>
                    <Grid sm='12' md='6'>
                        <Stack spacing={5} sx={{}}>
                            <Box sx={{display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                                <TextField id="outlined-basic" label="Starting Year*" variant="outlined" sx={{paddingRight: '30px', width: '130px'}}/>
                                <TextField id="outlined-basic" label="Ending Year*" variant="outlined" sx={{width: '130px'}}/>
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                <Button variant="outlined" sx={{width: '290px', height: '56px'}}><AddIcon /></Button>
                            </Box>
                        </Stack>
                    
                        

                    </Grid>
                    <Grid sm='12' md='3'>
                        <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                            <Stack spacing={5}>
                                <Autocomplete
                                    disablePortal
                                    options={options}
                                    sx={{ width: 270 }}
                                    renderInput={(params) => <TextField {...params} label="Select Administrative Type:*" />}
                                    />
                                <Autocomplete
                                    disablePortal
                                    options={options}
                                    sx={{ width: 270 }}
                                    renderInput={(params) => <TextField {...params} label="Specific Area:" />}
                                    />
                            
                            </Stack>
                        </Box>

                    </Grid>

                </Grid>
                <Box sx={{width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px'}}>
                    <Button color="primary" variant="contained" sx={{width: '220px', height: '50px', borderRadius: '15px', border: '1px solid black'}}>Generate Visualization</Button>
                </Box>
                
            </Paper>

        </Container>
    );
}

export default Dashboard;