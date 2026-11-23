import { Stack, Grid, Typography } from "@mui/material";
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";
import { useEffect, useState } from "react";
import { NewDropdown } from "../SearchPageComponents/NewDropdown";
import { NewDropdownMultiSelect } from "../SearchPageComponents/NewDropdownMultiSelect";
import {
  fetchAdministration,
  fetchLocations,
  fetchCityDetails
} from "../../helpers/fetchFunctions";
import {
  getCurrentAdminTypeURL,
  getSelectedAdminInstancesNames,
  getCurrentAdminTypeName,
} from "../../helpers/reducerHelpers";

const AmenityLocationSelect = ({
  cityURLs,
  setCityURLs,
  adminAreaTypesState,
  dispatchAdminAreaTypes,
  adminAreaInstancesState,
  dispatchAdminAreaInstances,
  dispatchCityState,
  isGeneratingVisualization,
  updateCurrentCityURI,
  updateCurrentAreaURI,
  updateCurrentAreaName
}) => {
  const [cityLoading, setCityLoading] = useState(false);
  const [adminTypesLoading, setAdminTypesLoading] = useState(false)

  const handleAdminTypeChange = async (newValue) => {
    dispatchAdminAreaTypes({ type: "SET_SELECTED", payload: newValue });

    if (!newValue) {
      // cascade down: clear instances
      dispatchAdminAreaInstances({ type: "SET_COORDINATES_AND_URLS", payload: {} });
      updateCurrentAreaName('');
      updateCurrentAreaURI('');
      return;
    }

    setAdminTypesLoading(true);
    try {
      await fetchLocations(newValue, cityURLs, adminAreaTypesState, dispatchAdminAreaInstances);
    } catch (e) {
      console.error('error loading admin instances: ', e);
    } finally {
      setAdminTypesLoading(false);
    }
  };

  const handleCityChange = async (newValue) => {
    await handleAdminTypeChange(null);          // cascade down: clears type + instances

    if (!newValue) {
      dispatchAdminAreaTypes({ type: "RESET" }); // also drop currCity and the type options
      updateCurrentCityURI('');
      return;
    }

    setCityLoading(true);
    try {
      await fetchAdministration(newValue, cityURLs, dispatchAdminAreaTypes);
      await fetchCityDetails(newValue, cityURLs, dispatchCityState);
      updateCurrentCityURI(cityURLs[newValue]);
    } catch (e) {
      console.error('error loading city: ', e);
    } finally {
      setCityLoading(false);
    }
  };

  return (
    <JoyBox sx={{ textAlign: "center", marginTop: { xs: "100px !important", md:"10px !important" } }}>
      
      <JoyBox
        sx={{ p: 2 }}
      >
        <Grid container>
            <JoyBox
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Stack spacing={2}>
                <NewDropdown
                  id="city-input"
                  key="city-input"
                  label="City"
                  value={adminAreaTypesState.currCity}
                  disabled={isGeneratingVisualization}
                  options={Object.keys(cityURLs)}
                  desc="Select the city which you want the indicator data for."
                  onChange={async (event, newValue) => handleCityChange(newValue)}
                  isLoading={cityLoading}
                />
             
                <NewDropdown
                  id="admin-type-input"
                  key={"admin-type-input"}
                  label="Administrative Area Type"
                  value={getCurrentAdminTypeName(adminAreaTypesState)}
                  // disabled={!(Object.keys(adminAreaTypesState).includes('currCity'))}
                  disabled={
                    isGeneratingVisualization ||
                    !Object.keys(adminAreaTypesState).includes("currCity")
                  }
                  options={Object.keys(adminAreaTypesState).filter(
                    (key) => key !== "currCity"
                  )}
                  desc="Select the demarcation type for analysis."
                  onChange={async (event, newValue) => handleAdminTypeChange(newValue)}
                  isLoading={adminTypesLoading}
                />
                <NewDropdownMultiSelect
                  id="admin-instances-multiinput"
                  key={"admin-instances-multiinput"}
                  label="Administrative Area Instance"
                  disabled={
                    isGeneratingVisualization ||
                    getCurrentAdminTypeURL(adminAreaTypesState) === null
                  }
                  options={Object.keys(adminAreaInstancesState)}
                  desc="Select the individual demarcation areas you want to analyze."
                  onChange={(event, newValue) => {
                    // console.log('amenity location select AREA INSTANCE multi select new value: ',newValue)
                    //console.log(ADMIN AREA INSTANCE STATE: ',adminAreaInstancesState)
                    dispatchAdminAreaInstances({
                      type: "SET_SELECTED",
                      payload: newValue,
                    });
                    //set data for parent
                    const areaName = newValue[0]
                    updateCurrentAreaName(areaName ?? '')
                    updateCurrentAreaURI(adminAreaInstancesState[areaName]?.URL ?? '')
                  }}
                  currentlySelected={getSelectedAdminInstancesNames(
                    adminAreaInstancesState
                  )}
                />
              </Stack>
            </JoyBox>
        </Grid>
      </JoyBox>
    </JoyBox>
  );
};

export default AmenityLocationSelect;
