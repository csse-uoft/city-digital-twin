import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dashboard from "./Dashboard";

// import {ReactComponent as Logo} from "../LOGO-SoC-RGB.svg";

// Vertical Navbar component
function Nav() {
    return ( 
        <Stack spacing={3} sx={{marginTop: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {/* <Logo style={{height:50}}/> */}
            <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><InsertChartIcon></InsertChartIcon>Dashboard</Button>
            <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><DashboardIcon></DashboardIcon>Edit Widgets</Button>
            <Divider sx={{ width: '75%', height: '1px'}} />
            <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><HelpOutlineIcon></HelpOutlineIcon>FAQ</Button>
        </Stack>
    );
}


// The main display that shows the navbar and the indicator dashboard pages
function Main() {
    return (
        <Grid container sx={{margin: '0px'}}>
            <Grid xs='4' sm='2'sx={{backgroundColor: 'background.paper', }}>
                <Nav />
            </Grid>
            <Grid xs='8' sm='10'>
                <Dashboard />
            </Grid>
        </Grid>
    );
}

export default Main;