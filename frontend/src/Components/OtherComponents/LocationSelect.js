import { Stack, Grid, Typography } from '@mui/material';
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";
import { useEffect, useState } from 'react';
import { NewDropdown } from '../SearchPageComponents/NewDropdown';
import { NewDropdownMultiSelect } from '../SearchPageComponents/NewDropdownMultiSelect';
import { fetchAdministration, fetchLocations } from '../../helpers/fetchFunctions';
import { getCurrentAdminTypeURL, getSelectedAdminInstancesNames, getCurrentAdminTypeName } from '../../helpers/reducerHelpers';

const LocationSelect = ({cityURLs, setCityURLs, adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances}) => {
  const [cityLoading, setCityLoading] = useState(false);

  useEffect(() => {
    // console.log("City Loading: ", cityLoading);
    // console.log("City URLs: ", cityURLs);
  }, [cityLoading, cityURLs]);

  return (
    <JoyBox sx={{ textAlign: 'center', marginBottom: '50px' }}>
      <JoyBox
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '40px',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="h5"
          style={{
            fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
            fontSize: 35,
            fontWeight: "bold",
            color: "#0b2f4e",
          }}
        >
          Location & Area Type
        </Typography>
    </JoyBox>
    <JoySheet
      variant="outlined"
      sx={{ p: 2, borderRadius: "sm", paddingBottom: "50px" }}
    >
      <Grid container>
        <Grid xs="12" md="6">
          <JoyBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            
            <Stack spacing={5}>
              <NewDropdown
                id="city-input"
                key="city-input"
                label="City"
                value={adminAreaTypesState.currCity}
                disabled={false}
                options={Object.keys(cityURLs)}
                desc="Select the city which you want the indicator data for."
                onChange={async (event, newValue) => {
                  setCityLoading(true);
                  await fetchAdministration(
                    newValue,
                    cityURLs,
                    dispatchAdminAreaTypes
                  );
                  setCityLoading(false);
                }}
                isLoading={cityLoading}
              />
            </Stack>
          </JoyBox>
        </Grid>
        <Grid xs="12" md="6">
          <JoyBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <Stack spacing={5}>
              <NewDropdown
                id="admin-type-input"
                key={"admin-type-input"}
                label="Administrative Area Type"
                value={getCurrentAdminTypeName(adminAreaTypesState)}
                disabled={!(Object.keys(adminAreaTypesState).includes('currCity'))}
                options={Object.keys(adminAreaTypesState).filter(key => key !== 'currCity')}
                desc="Select the demarcation type for analysis."
                onChange={(event, newValue) => {
                  dispatchAdminAreaTypes({
                    type: "SET_SELECTED",
                    payload: newValue,
                  });
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
                disabled={ getCurrentAdminTypeURL(adminAreaTypesState) === null }
                options={Object.keys(adminAreaInstancesState)}
                desc="Select the individual demarcation areas you want to analyze."
                onChange={(event, newValue) => {
                  dispatchAdminAreaInstances({
                    type: "SET_SELECTED",
                    payload: newValue,
                  });
                
              }}
              currentlySelected={getSelectedAdminInstancesNames(adminAreaInstancesState)}
              />
            </Stack>
          </JoyBox>
        </Grid>
      </Grid>
    </JoySheet>
  </JoyBox>
  );
};

export default LocationSelect;