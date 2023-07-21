import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dashboard from "./Dashboard";

// Vertical Navbar component
function Nav() {
    return ( 
        <Stack spacing={3} sx={{marginTop: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button variant="text" sx={{color: 'text.primary', width: '100%'}} ><InsertChartIcon></InsertChartIcon>Dashboard</Button>
            <Button variant="text" sx={{color: 'text.primary', width: '100%'}} ><DashboardIcon></DashboardIcon>Edit Widgets</Button>
            <Divider sx={{ width: '75%', height: '1px'}} />
            <Button variant="text" sx={{color: 'text.primary', width: '100%'}} ><HelpOutlineIcon></HelpOutlineIcon>FAQ</Button>
        </Stack>
    );
}


// The main display that shows the navbar and the indicator dashboard pages
function Main() {
    return (
        <Grid container sx={{margin: '0px'}}>
            <Grid xs='2' sx={{backgroundColor: 'background.paper', height: '100vh'}}>
                <Nav />
            </Grid>
            <Grid xs='10'>
                <Dashboard />
            </Grid>
        </Grid>
    );
}

export default Main;