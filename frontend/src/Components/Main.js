import { Button, Divider, Grid, Paper, Stack, Typography } from "@mui/material";
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Dashboard from "./Dashboard";
import Home from "./Home";

import {ReactComponent as Logo} from "../LOGO-SoC-RGB.svg";

import MobileHeader from "./MobileHeader";
import NewSidebar from "./NewSidebar";
import {Box as JoyBox, Stack as JoyStack, List as JoyList, ListItem as JoyListItem, ListItemButton as JoyListItemButton, ListItemDecorator as JoyListItemDecorator, ListItemContent as JoyListItemContent, Divider as JoyDivider} from "@mui/joy";
import { useState } from "react";

// Vertical Navbar component
function Nav() {
    return ( 
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
    const [ activePage, setActivePage ] = useState("dashboard");

    const [ dashboardData, setDashboardData ] = useState({
        currentCity: {
            name: "",
            URI: ""
        },
        availableCities: {},
        permanentCards: [],
        savedCards: [],
        initialCityChosen: false
    });

    const [ searchPageData, setSearchPageData ] = useState({
        
    });

    const choosePage = () => {
        switch (activePage) {
            case "dashboard":
                return <Home data={dashboardData} setData={setDashboardData}/>;
                break;
            case "search":
                return <Dashboard />;
                break;
            default:
                break;
        }
    };

    return (
        <JoyBox sx={{ display: 'flex', minHeight: '100dvh' }}>
            <MobileHeader/>
            <NewSidebar activePage={activePage} setActivePage={setActivePage} />
            { choosePage() }
            {/* <Dashboard /> */}
        </JoyBox>
    );
}

export default Main;