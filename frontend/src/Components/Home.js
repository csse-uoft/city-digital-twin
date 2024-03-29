import { useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { Select, Option } from "@mui/joy";
import { Stack } from "@mui/joy";

import TopBarIndicator from "./HomeDashboardComponents/TopBarIndicator";
import PermanentIndicator from "./HomeDashboardComponents/PermanentIndicator";
import TemporaryIndicator from "./HomeDashboardComponents/TemporaryIndicator";
import { fetchCities, fetchPermanentIndicatorData, fetchSavedIndicatorData } from "./HomeDashboardComponents/dashboard_helper_functions";

/*
 * The Home page is where saved indicators should be shown. It is mostly unimplemented.
 * There are two types of saved indicators: 
 *  - Temporary indicators are those that the user has chosen to save from the search page. After generating a visualization, the user will be able to
 *    save that visualization. Its current state will then be added to the Home page as a temporary indicator.
 *  - Permanent indicators are those that are pre-selected, not requiring user input. These would probably be pre-selected by developers.
 *    Examples would be things like population, crime rates, etc.
 */
export default function Home({data, setData}) {

  // Load all available cities upon page load
  useEffect(() => {
    fetchCities(data, setData);
    console.log(data.availableCities);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}>
      <Stack spacing={5}>
        <header>
          <Typography variant="h4" sx={{textAlign:"center", marginBottom:"10px", fontWeight:"bold", fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontSize:40}}>Indicator Dashboard</Typography>
          <Select 
            placeholder="Select City" 
            sx={{margin:"auto", maxWidth:"250px", marginBottom:"10px"}}
            onChange={(_, newValue) => {
              const tempDashData = {...data};
              tempDashData.currentCity.id = newValue;
              tempDashData.currentCity.name = tempDashData.availableCities[newValue].name;
              tempDashData.currentCity.URI = tempDashData.availableCities[newValue].URI;

              if (!tempDashData.initialCityChosen) {
                tempDashData.initialCityChosen = true;
              }
              
              setData(tempDashData);

              fetchPermanentIndicatorData(data, setData);
              fetchSavedIndicatorData(data, setData);
            }}
          >
            {Object.entries(data.availableCities).map(([cityID, cityData]) => (
              <Option value={cityID}>{cityData.name}</Option>
            ))}
          </Select>
          <TopBarIndicator />
        </header>
        
        {/* The permanent indicators. */}
        <Stack id="permanentIndicators" spacing={1}direction="row" justifyContent="space-around" sx={{flexWrap:"wrap", rowGap:"20px"}}>
          <PermanentIndicator/>
          <PermanentIndicator/>
          <PermanentIndicator/>
        </Stack>
        
        {/* The temporary indicators. */}
        <Stack id="temporaryIndicators" spacing={1}direction="row" justifyContent="space-around" sx={{flexWrap:"wrap", rowGap:"20px"}}>
          <TemporaryIndicator />
          <TemporaryIndicator />
          <TemporaryIndicator />
        </Stack>
      </Stack>
    </Container>
  );
}