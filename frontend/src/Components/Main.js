import Dashboard from "./Dashboard";
import Home from "./Home";
import FAQ from "./FAQ";
import Amenities from './Amenities/Amenities'

import MobileHeader from "./MainComponents/MobileHeader";
import NewSidebar from "./MainComponents/NewSidebar";
import {Box as JoyBox } from "@mui/joy";
import { useState, useEffect, useReducer } from "react";
import CompleteCommunitiesDashboard from "./CompleteCommunitiesDashboard";
import { adminAreaTypeReducer } from "../reducers/adminAreaTypeReducer";
import { adminAreaInstanceReducer } from "../reducers/adminAreaInstanceReducer";
import { adminCompareAreaInstanceReducer } from '../reducers/adminCompareAreaInstanceReducer'
import { cityReducer } from '../reducers/cityReducer'
import { filterPanelReducer } from '../reducers/filterPanelReducer'
import { chartCategoryParameterReducer, chartSubtypeParameterReducer, chartParameterReducer, chartEditParameterReducer } from '../reducers/chartParameterReducer'
import { fetchCities } from "../helpers/fetchFunctions";

// The main display that shows the navbar and the indicator dashboard pages
function Main() {
  // Location states extracted

  /*
   * City names mapped to their unique URIs.
   * Example: { toronto : "url.com/uniqueuri" }
  */
  const [cityURLs, setCityURLs] = useState({});

  // Checkout reducers.js for the state structure
  const [adminAreaTypesState, dispatchAdminAreaTypes] = useReducer(adminAreaTypeReducer, {});
  const [adminAreaInstancesState, dispatchAdminAreaInstances] = useReducer(adminAreaInstanceReducer, {});
  const [compareAdminAreainstancesState, dispatchCompareAdminAreaInstances] = useReducer(adminCompareAreaInstanceReducer, {})
  const [cityState, dispatchCityState] = useReducer(cityReducer, {})
  const [filterPanelState, dispatchFilterPanelState] = useReducer(filterPanelReducer, {})
  const [chartCategoryParameterState, dispatchChartCategoryParameterState] = useReducer(chartCategoryParameterReducer, {})
  const [chartSubtypeParameterState, dispatchChartSubtypeParameterState] = useReducer(chartSubtypeParameterReducer, {})
  //new
  const [chartParameterState, dispatchChartParameterState] = useReducer(chartParameterReducer, {})
  const [chartEditParameterState, dispatchChartEditParameterState] = useReducer(chartEditParameterReducer, {})

  useEffect(() => {
    fetchCities(setCityURLs);
  }, []);

  const [ activePage, setActivePage ] = useState("amenities");

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
        return <Dashboard 
                cityURLs={cityURLs}
                setCityURLs={setCityURLs}
                adminAreaTypesState={adminAreaTypesState}
                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                adminAreaInstancesState={adminAreaInstancesState}
                dispatchAdminAreaInstances={dispatchAdminAreaInstances}
                />;
      case "amenities":
        return <Amenities
                cityURLs={cityURLs}
                setCityURLs={setCityURLs}
                cityState={cityState}
                dispatchCityState={dispatchCityState}
                filterPanelState={filterPanelState}
                dispatchFilterPanelState={dispatchFilterPanelState}
                chartCategoryParameterState={chartCategoryParameterState}
                dispatchChartCategoryParameterState={dispatchChartCategoryParameterState}
                chartSubtypeParameterState={chartSubtypeParameterState}
                dispatchChartSubtypeParameterState={dispatchChartSubtypeParameterState}
                adminAreaTypesState={adminAreaTypesState}
                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                adminAreaInstancesState={adminAreaInstancesState}
                dispatchAdminAreaInstances={dispatchAdminAreaInstances} 
                dispatchCompareAdminAreaInstances={dispatchCompareAdminAreaInstances}
                chartParameterState={chartParameterState}
                dispatchChartParameterState={dispatchChartParameterState}
                chartEditParameterState={chartEditParameterState}
                dispatchChartEditParameterState={dispatchChartEditParameterState}
                />
      case "faq":   // Not completed yet
        return <FAQ />;
      case "complete community":
        return <CompleteCommunitiesDashboard 
                cityURLs={cityURLs}
                setCityURLs={setCityURLs}
                adminAreaTypesState={adminAreaTypesState}
                dispatchAdminAreaTypes={dispatchAdminAreaTypes}
                adminAreaInstancesState={adminAreaInstancesState}
                dispatchAdminAreaInstances={dispatchAdminAreaInstances}
                />;
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