import { Stack, Grid, Typography } from '@mui/material';
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";

import { NewDropdown } from './SearchPageComponents/NewDropdown';

const LocationSelect = ({adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances}) => {
  
  return (
    <JoyBox sx={{ textAlign: 'center', marginBottom: '50px' }}>
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
                label="City"
                options={[]}
                desc="Select the city which you want the indicator data for."
                disabled={false}
                onChange={() => {}}
                id=""
                isLoading={false}
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
                label="Administrative Area"
                options={[]}
                desc="Select the demarcation type for analysis."
                disabled={false}
                onChange={() => {}}
                id=""
                isLoading={false}
              />
              <NewDropdown
                label="Administrative Area Instance"
                options={[]}
                desc="Select the individual demarcation areas you want to analyze."
                disabled={false}
                onChange={() => {}}
                id=""
                isLoading={false}
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