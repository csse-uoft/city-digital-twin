import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dashboard from "./Dashboard";

import {ReactComponent as Logo} from "../LOGO-SoC-RGB.svg";

import MobileHeader from "./MobileHeader";
import NewSidebar from "./NewSidebar";
import {Box as JoyBox, Stack as JoyStack, List as JoyList, ListItem as JoyListItem, ListItemButton as JoyListItemButton, ListItemDecorator as JoyListItemDecorator, ListItemContent as JoyListItemContent, Divider as JoyDivider} from "@mui/joy";

// Vertical Navbar component
function Nav() {
    return ( 
    //     <Stack spacing={3} sx={{marginTop: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    //         <Logo style={{height:50}}/>
    //         <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><InsertChartIcon></InsertChartIcon>Dashboard</Button>
    //         <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><DashboardIcon></DashboardIcon>Edit Widgets</Button>
    //         <Divider sx={{ width: '75%', height: '1px'}} />
    //         <Button variant="text" sx={{color: 'text.primary', width: '100%', fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontWeight:"normal", fontSize:18}} ><HelpOutlineIcon></HelpOutlineIcon>FAQ</Button>
    //     </Stack>

        <JoyStack spacing={3} sx={{marginTop: '10%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Logo style={{height:50}}/>
            <JoyList size="md" sx={{'--List-padding': '4px',}}>
                <JoyListItem>
                    <JoyListItemButton variant="plain">
                        <JoyListItemDecorator><InsertChartIcon></InsertChartIcon></JoyListItemDecorator>
                        <JoyListItemContent>Dashboard</JoyListItemContent>
                    </JoyListItemButton>
                    
                </JoyListItem>
                <JoyListItem>
                    <JoyListItemDecorator><DashboardIcon></DashboardIcon></JoyListItemDecorator>
                    <JoyListItemContent>Edit Widgets</JoyListItemContent>
                </JoyListItem>
                <JoyDivider />
                <JoyListItem>
                    <JoyListItemDecorator><InsertChartIcon></InsertChartIcon></JoyListItemDecorator>
                    <JoyListItemContent>FAQ</JoyListItemContent>
                </JoyListItem>
            </JoyList>
        </JoyStack>
    );
}


// The main display that shows the navbar and the indicator dashboard pages
function Main() {
    return (
        <JoyBox sx={{ display: 'flex', minHeight: '100dvh' }}>
            <MobileHeader/>
            <NewSidebar />
            <Dashboard />
        </JoyBox>
        // <Grid container sx={{margin: '0px'}}>
        //     <Grid xs='4' sm='2'sx={{ }}>
        //         <NewSidebar />
        //         {/* <Nav /> */}
        //     </Grid>
        //     <Grid xs='8' sm='10'>
        //         <Dashboard />
        //     </Grid>
        // </Grid>
    );
}

export default Main;