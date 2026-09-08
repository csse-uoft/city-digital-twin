import { Stack, Grid, Typography, Button } from "@mui/material";
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";
import { Button as JoyButton } from "@mui/joy"
import { useState, useEffect } from 'react'
import { NewDropdownMultiSelect } from "../SearchPageComponents/NewDropdownMultiSelect";
import TableChartIcon from '@mui/icons-material/TableChart';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  fetchAdministration,
  fetchLocations,
} from "../../helpers/fetchFunctions";
import {
  getCurrentAdminTypeURL,
  getSelectedAdminInstancesNames,
  getSelectedCompareAdminInstancesNames,
  getCurrentAdminTypeName,
} from "../../helpers/reducerHelpers";
import ComparisonModal from './Comparison/ComparisonModal'

const CompareSelect = ({
    cityURI,
    adminAreaTypesState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchAdminAreaInstances,
    areaURIList,
    // compareAdminAreaInstancesState,
    // dispatchCompareAdminAreaInstances,
    isGeneratingVisualization,
    amenityData,
    chartParameterState,
    dispatchChartParameterState,
    chartEditParameterState,
    dispatchChartEditParameterState,
    amenityCategories
}) => {
    const [openComparisonModal, setOpenComparisonModal] = useState(false)
    //console.log('selected compare instances: ',getSelectedAdminInstancesNames(adminAreaInstancesState))
    return (
        <JoyBox sx={{ textAlign: "center" }}>
            <JoyBox sx={{p: 2}}>
                <ComparisonModal 
                    amenityData={amenityData} 
                    open={openComparisonModal} 
                    areaURIList={areaURIList} 
                    amenityCategories={amenityCategories}
                    cityURI={cityURI}
                    chartParameterState={chartParameterState}
                    dispatchChartParameterState={dispatchChartParameterState}
                    chartEditParameterState={chartEditParameterState}
                    dispatchChartEditParameterState={dispatchChartEditParameterState}
                    onClose={()=>setOpenComparisonModal(false)}
                     />
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
                                // console.log('compare multiselect value: ', newValue)
                                dispatchAdminAreaInstances({
                                    type:"SET_COMPARE",
                                    payload: newValue
                                })
                            }}
                            currentlySelected={getSelectedCompareAdminInstancesNames(
                                adminAreaInstancesState
                            )}
                            />

                            <JoyButton startDecorator={<CompareArrowsIcon />} disabled={Object.keys(areaURIList).length < 2} sx={{width:"150px"}} variant="outlined" size="sm" onClick={()=>setOpenComparisonModal(true)}>Compare</JoyButton>
                        </Stack>
                    </JoyBox>
                </Grid>
            </JoyBox>
        </JoyBox>
    )
}

export default CompareSelect