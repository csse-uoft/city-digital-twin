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
}) => {
  const [cityLoading, setCityLoading] = useState(false);

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
                  onChange={async (event, newValue) => {
                    setCityLoading(true);
                    await fetchAdministration(
                      newValue,
                      cityURLs,
                      dispatchAdminAreaTypes,
                    );
                    await fetchCityDetails(
                      newValue,
                      cityURLs,
                      dispatchCityState
                    )
                    setCityLoading(false);
                  }}
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
                  onChange={(event, newValue) => {
                    dispatchAdminAreaTypes({
                      type: "SET_SELECTED",
                      payload: newValue,
                    });
                    console.log('fetchLocations newValue: ', newValue)
                    console.log('fetchLocations cityURLS: ', cityURLs)
                    console.log('fetchLocations adminAreaTypesState: ', adminAreaTypesState)
                    console.log('fetchLocations dispatchAdminAreaInstances: ', dispatchAdminAreaInstances)
                    fetchLocations(
                      newValue,
                      cityURLs,
                      adminAreaTypesState,
                      dispatchAdminAreaInstances
                    );
                  }}
                  isLoading={false}
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
                    console.log('multi select new value: ',newValue)
                    dispatchAdminAreaInstances({
                      type: "SET_SELECTED",
                      payload: newValue,
                    });
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
