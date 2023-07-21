import { Autocomplete, Box, Button, Container, Grid, Stack, TextField } from "@mui/material";
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
        <Container maxWidth='lg' sx={{marginTop: '70px'}}>
            {/* Input Form */}
            <Grid container>
                <Grid xs='3'>
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
                    
                </Grid>
                <Grid xs='6'>
                    <Stack spacing={5} sx={{}}>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <TextField id="outlined-basic" label="Starting Year*" variant="outlined" sx={{paddingRight: '30px', width: '130px'}}/>
                            <TextField id="outlined-basic" label="Ending Year*" variant="outlined" sx={{width: '130px'}}/>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'center'}}>
                            <Button variant="outlined" sx={{width: '290px', height: '56px'}}><AddIcon /></Button>
                        </Box>
                    </Stack>
                   
                    

                </Grid>
                <Grid xs='3'>
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

                </Grid>

            </Grid>

        </Container>
    );
}

export default Dashboard;