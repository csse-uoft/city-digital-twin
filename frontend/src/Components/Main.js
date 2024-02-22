import Dashboard from "./Dashboard";
import Home from "./Home";
import FAQ from "./FAQ";

import MobileHeader from "./MainComponents/MobileHeader";
import NewSidebar from "./MainComponents/NewSidebar";
import {Box as JoyBox } from "@mui/joy";
import { useState, useEffect } from "react";
import axios from "axios";

// The main display that shows the navbar and the indicator dashboard pages
function Main() {
    const [ activePage, setActivePage ] = useState("dashboard");

    const [ dashboardData, setDashboardData ] = useState({
        currentCity: {
            id: -1,
            name: "",
            URI: ""
        },
        availableCities: {},
        permanentCards: [
            {
                id: 1,
                name: "Test",

                allowedGraphTypes: [],
                currentGraphType: "line",

                indicatorData: {},
                mainValue: 0,
                dataSPARQLQuery: "",

                allowedSubdivisions: [],
                currentSubdivision: "",
                currentSubDividedData: {}
            }
        ],
        savedCards: [],
        initialCityChosen: false,
        userSettings: {
            numYearsForGraphs: 5
        },
        savedIndicators: { num: 0 }
    });

    const choosePage = () => {
        switch (activePage) {
            case "dashboard":
                return <Home data={dashboardData} setData={setDashboardData} />;
            case "search":
                return <Dashboard savedIndicators={dashboardData.savedIndicators} setDashboardData={setDashboardData}/>;
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