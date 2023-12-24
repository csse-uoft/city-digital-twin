import Dashboard from "./Dashboard";
import Home from "./Home";
import FAQ from "./FAQ";

import MobileHeader from "./MobileHeader";
import NewSidebar from "./NewSidebar";
import {Box as JoyBox } from "@mui/joy";
import { useState } from "react";

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

    const choosePage = () => {
        switch (activePage) {
            case "dashboard":
                return <Home data={dashboardData} setData={setDashboardData} />;
            case "search":
                return <Dashboard />;
            case "faq":
                return <FAQ />;
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