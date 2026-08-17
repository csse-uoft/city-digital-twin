import { Stack, Grid, Typography, Button } from "@mui/material";
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";
import { Button as JoyButton } from "@mui/joy"
import { useState, useEffect } from 'react'
import { NewDropdownMultiSelect } from "../SearchPageComponents/NewDropdownMultiSelect";
import {
  fetchAdministration,
  fetchLocations,
} from "../../helpers/fetchFunctions";
import {
  getCurrentAdminTypeURL,
  getSelectedAdminInstancesNames,
  getCurrentAdminTypeName,
} from "../../helpers/reducerHelpers";
import ComparisonModal from './Comparison/ComparisonModal'

const CompareSelect = ({
    cityURLs,
    setCityURLs,
    adminAreaTypesState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchCompareAdminAreaInstances,
    isGeneratingVisualization,
    amenityData
}) => {
    const [openComparisonModal, setOpenComparisonModal] = useState(false)
    //console.log('selected compare instances: ',getSelectedAdminInstancesNames(adminAreaInstancesState))
    return (
        <JoyBox sx={{ textAlign: "center" }}>
            <JoyBox sx={{p: 2}}>
                <ComparisonModal amenityData={amenityData} open={openComparisonModal} onClose={()=>setOpenComparisonModal(false)} />
                <Grid container>
                    <JoyBox
                    sx={{
                        width:"100%",
                        display:"flex",
                        justifyContent:"center"
                    }}>
                        <Stack spacing={2}>
                            <NewDropdownMultiSelect 
                            id="compare-admin-instances-multiinput"
                            key={"compare-admin-instances-multiinput"}
                            label="Compare Administrative Area Instances"
                            disabled={
                                isGeneratingVisualization ||
                                getCurrentAdminTypeURL(adminAreaTypesState) === null
                            }
                            options={getSelectedAdminInstancesNames(
                                adminAreaInstancesState
                            )}
                            desc="Select the individual demarcation areas you want to compare."
                            onChange={(event, newValue) => {
                                //console.log('compare multiselect value: ', newValue)
                                dispatchCompareAdminAreaInstances({
                                    type:"SET_SELECTED",
                                    payload: newValue
                                })
                            }}
                            />

                            <JoyButton sx={{width:"150px"}} variant="outlined" size="sm" onClick={()=>setOpenComparisonModal(true)}>Compare</JoyButton>
                        </Stack>
                    </JoyBox>
                </Grid>
            </JoyBox>
        </JoyBox>
    )
}

export default CompareSelect