import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AreaChart, Area } from "recharts";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState, useReducer } from "react";
import "leaflet/dist/leaflet.css";
import { Popup, Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import {
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchCities,
  fetchAdministration,
  fetchIndicators,
  fetchLocations,
} from "../helpers/fetchFunctions";

import {
  handleSum,
  handleAggregation,
  handleAddIndicator,
  handleAddYears,
  handleGenerateVisualization,
  handleUpdateIndicators,
  handleUpdateYear,
  handleDeleteIndicator
} from "../helpers/eventHandlers";

import { 
  getCurrentAdminTypeURL, 
  getSelectedAdminInstancesNames,
  getSelectedAdminInstancesURLs, 
  mapInstanceURLtoName
} from "../helpers/reducerHelpers";

import MapView from "./DataVisComponents/MapView";
import IndicatorTable from "./DataVisComponents/Table";
import ActivePie from "./DataVisComponents/ActivePie";
import { Header } from "./SearchPageComponents/Header";

import { Button as JoyButton } from "@mui/joy";
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";

import CloseIcon from "@mui/icons-material/Close";
import SaveAsIcon from '@mui/icons-material/SaveAs';

import { NewDropdown, NewDropdownStateValue } from "./SearchPageComponents/NewDropdown";
import { NewDropdownMultiSelect } from "./SearchPageComponents/NewDropdownMultiSelect";
import { NumberInput } from "./SearchPageComponents/NumberInput";
import ComparisonGraph from "./DataVisComponents/ComparisonGraph";

import { adminAreaTypeReducer } from "../reducers/adminAreaTypeReducer";
import { adminAreaInstanceReducer } from "../reducers/adminAreaInstanceReducer";

import DeleteIcon from '@mui/icons-material/Delete';
import LocationSelect from "./OtherComponents/LocationSelect";


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});


/*
 * Implements the search page. 
 */
function Dashboard({cityURLs, setCityURLs, adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances}) {
  /*
   * The time ranges being considered for the indicators.
   * Format: An array of objects, each containing a time range for a 
   *   corresponding indicator. Years[0], the first entry, gives the 
   *   year range for indicator 1.
   * Parameters for each array entry: 
   *   start = start year for year range, 
   *   end = end year for year range, 
   *   id = the corresponding indicator the time range is for (id = 0 → first indicator)
   * Example: [{value1:2016, value2:2018, id:0}]
   */
  const [years, setYears] = useState([{ value1: 0, value2: 0, id: 0 }]);

  /*
   * Indicator names mapped to their unique URIs.
   * Format: An object. The key is the name of the indicator and the value is the URL.
   * Example: {“TheftOverCrime2014”: “http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrime2014”} 
  */
  const [indicatorURLs, setIndicatorURLs] = useState({});

  /*
   * The names of the indicators that are currently selected from each dropdown.
   * Format: Key-value pairs, where the key is the index of the dropdown (0-->first dropdown) and the value is the NAME of the indicator selected.
   * Example: {0:"TheftOverCrime2016", 1:"TheftOverCrimeRate2016"}
   */
  const [selectedIndicators, setSelectedIndicators] = useState({ 0: "" });

  /*
   * The data for each selected indicator.
   * Format: An object with all selected indicators as its child objects. 
   *   Each child object (selected indicator) is a URI that maps to the selected area’s URI. 
   *   Finally, the selected Area’s URI maps to the each year and its desired data/value.
   * Example: 
      {
        "http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016": {
          "http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood82": {
            "2016": 51,
            "2017": 35,
            "2018": 42
          }
        }
      }
   */
  const [indicatorData, setIndicatorData] = useState({});

  /*
   * The polygons used to draw the administrative area instances on the map.
   * Format: key-value pairs, where the key is the URI of the desired indicator and the value is an object containing all the polygons of the 
   *         selected administrative area type, including those not selected as well as the indicator data of the selected areas
   * Parameters: 
   *   - index: the index of the indicator (which box in the form it's a part of)
   * Example: {"http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2018":{index:0, polygons:[THE POLYGONS, IN AN ARRAY.]}
   */
  const [mapPolygons, setMapPolygons] = useState({});


  const [showingVisualization, setShowingVisualization] = useState(false);

  /*
   * Whether the visualization generation functions should activate.
   * True if the program is ready for the visualization to generate, false otherwise.
   */
  const [beginGeneration, setBeginGeneration] = useState(false);


  const [currentSelectedMultiIndicators, setCurrentSelectedMultiIndicators] = useState([]);

  /*
   * The relevant table column names for each indicator.
   * The first column is always "Admin Area Name", followed by the year range that the user has selected for the current indicator
   * Format: Key-value pairs, where the key is the URI of the indicator and the value is an array of strings representing the years selected for the data
   * Example: {"http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016":["Admin Area Name", "2016", "2017", "2018"]}
   */
  const [tableColumns, setTableColumns] = useState({});

  /*
   * The indicators data, formatted for display on the table.
   * Format: Key-value pairs, where the key is the URI of the indicator and the value is an array of arrays, each representing a row on the 
   *         table; the first element of the innermost sub-array is the name of the administrative area instance, followed by a list of NUMERICAL (not string) values
   *         for the year range, as determined in tableColumns for that indicator.
   * Example: {"http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016":[["Waterfront Communities-The Island (77)", 20, 30, 40], ["Atlantis", 0, 0, 0]]}
   */
  const [tableData, setTableData] = useState({});

  /*
   * The indicators data, formatted for display on the graphs.
   * Example: 
      {"http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016": [
          {
            "name": "2016",
            "York South-Weston (5)": 192,
            "Parkdale-High Park (4)": 145,
            "Etobicoke Centre (2)": 226
          }, {
            "name": "2017",
            "York South-Weston (5)": 318,
            "Parkdale-High Park (4)": 227,
            "Etobicoke Centre (2)": 265
          }, {
            "name": "2018",
            "York South-Weston (5)": 324,
            "Parkdale-High Park (4)": 177,
            "Etobicoke Centre (2)": 308
          }
        ]
      }
   */
  const [chartData, setChartData] = useState({});

  /*
   * Indicates if an error has occured while trying to generate a visualization.
   * Used for showing an error message if this happens.
   * Format: A boolean value, true if an error has occured or false otherwise
   * Parameters: N/A
   * Example: lol
   */
  const [showVisError, setShowVisError] = useState(false);


  /*
   * The graph type selected for the FIRST graph of each indicator visualization. 
   * Each visualization has two customizable graphs, with various types available: bar, line, etc.
   * Format: key-value pairs, where the key is the indicator URI and the value is the graph type (bar, line, etc.)
   * Parameters: N/A
   * Example: {'http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016': 'bar'}
   */
  const [graphTypes, setGraphTypes] = useState({});

  /*
   * The graph type selected for the SECOND graph of each indicator visualization. 
   * Each visualization has two customizable graphs, with various types available: bar, line, etc.
   * Format: key-value pairs, where the key is the indicator URI and the value is the graph type (bar, line, etc.)
   * Parameters: N/A
   * Example: {'http://ontology.eil.utoronto.ca/CKGN/Crime#TheftOverCrimeRate2016': 'bar'}
   */
  const [comparisonGraphTypes, setComparisonGraphTypes] = useState({});

  /*
   * Indicates if the program is loading the indicator visualization.
   * Used primarily for showing loading indicators while this is going on.
   * Format: A boolean value, true if loading or false otherwise
   * Parameters: N/A
   * Example: lol
   */
  const [visLoading, setVisLoading] = useState(false);

  /*
   * Indicates if the user has selected a city from the dropdown, which begins loading in values for the other dropdowns.
   * Format: A boolean value, true if loading or false otherwise
   */
  const [cityLoading, setCityLoading] = useState(false);

  // Colour wheel for the visualizations
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ffc0cb",
    "#ff7f50",
    "#ff69b4",
    "#9acd32",
  ];


  // Upon initial page load, fetch list of indicators
  useEffect(() => {
    fetchIndicators(setIndicatorURLs);
  }, []);


  useEffect(() => {
    console.log("Types State updated:", adminAreaTypesState);
    
  }, [adminAreaTypesState]);

  // This useEffect is for testing and developement purposes.
  useEffect(() => {
    // console.log("indicatorURLs:", indicatorURLs);
    // console.log("Size of indicatorURLs:", Object.keys(indicatorURLs).length);
    // console.log("selectedIndicators:", selectedIndicators);
    // console.log("indicatorData:", indicatorData);
    // console.log("currentSelectedMultiIndicators:", currentSelectedMultiIndicators);

    // console.log("tabeColumns:", tableColumns);
    // console.log("tableData:", tableData);
    // console.log("chartData:", chartData);

    // console.log("graphTypes:", graphTypes);
    // console.log("comparisonGraphTypes:", comparisonGraphTypes);

    // console.log("years:", years);

    // console.log("END OF USE EFFECT");

  }, [cityURLs, currentSelectedMultiIndicators, indicatorURLs, selectedIndicators, indicatorData, mapPolygons, showingVisualization, beginGeneration, currentSelectedMultiIndicators, tableColumns, tableData, chartData, showVisError, graphTypes, comparisonGraphTypes, visLoading, cityLoading]);


  useEffect(() => {
    // Also checks if number of keys in indicatorData is equal to length of selectedIndicators - will indicate if completely done previous step
    if (
      beginGeneration &&
      Object.keys(indicatorData).length ===
        Object.keys(selectedIndicators).length
    ) {
      const currentIndicatorNames = Object.fromEntries(
        Object.entries(indicatorURLs).map(([key, value]) => [value, key])
      );
      const indicatorIndices = Object.fromEntries(
        Object.entries(selectedIndicators).map(([key, value]) => [value, key])
      );

      setMapPolygons({});
      setTableColumns({});
      setTableData({});
      setChartData({});

      Object.keys(indicatorData).forEach((indicator) => {
        var yearRange = [];
        const ind = parseInt(
          indicatorIndices[currentIndicatorNames[indicator]]
        );
        for (let i = years[ind].value1; i <= years[ind].value2; ++i) {
          yearRange.push(i.toString());
        }

        // Set table information: column names and data
        setTableColumns((prevColumns) => ({
          ...prevColumns,
          [indicator]: ["Admin Area Name"].concat(yearRange),
        }));

        setTableData((prevData) => ({
          ...prevData,
          [indicator]: Object.entries(indicatorData[indicator].data).map(
            ([instanceURL, data]) =>
              [mapInstanceURLtoName(adminAreaInstancesState, instanceURL)].concat(
                Object.entries(data).map(([year, value]) => value)
              )
          ),
        }));

        // Set chart information
        const tempChartData = yearRange.map(
          (year) => {
            const res = { name: year };
            
            const selectedAdminInstancesURLs = getSelectedAdminInstancesURLs(adminAreaInstancesState);

            // we want to get an object of type { "Area Name": value, "Area Name": value, ... }

            const val = Object.fromEntries(
              selectedAdminInstancesURLs.map((instanceURL) => [
                mapInstanceURLtoName(adminAreaInstancesState, instanceURL),
                indicatorData[indicator].data[instanceURL][year],
              ])
            );

            return { ...res, ...val };
          }
        );

        setChartData((oldData) => ({
          ...oldData,
          [indicator]: tempChartData,
        }));

        // Set map information

        const itemColor = (key) => {
          if (Object.keys(indicatorData[indicator].data).indexOf(key) !== -1) {
            return "green";
          } else {
            return "red";
          }
        };

        const newPolygons = Object.keys(adminAreaInstancesState).map((key) => {
          const instanceURL = adminAreaInstancesState[key].URL; 
          return (
          <Polygon
            key={instanceURL}
            pathOptions={{ color: itemColor(instanceURL) }}
            positions={adminAreaInstancesState[key].coordinates}
          >
            {Object.keys(indicatorData[indicator].data).indexOf(instanceURL) === -1 ? (
              <>
                <Tooltip sticky>
                  <strong>{mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}</strong> <br />
                  Area was not selected
                </Tooltip>
                <Popup>
                  <strong>{mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}</strong> <br />
                  Area was not selected
                </Popup>
              </>
            ) : (
              <>
                <Tooltip sticky>
                  <strong>{mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}</strong> <br />
                  {selectedIndicators[ind]}:<br />
                  {Object.entries(indicatorData[indicator].data[instanceURL]).map(
                    ([year, value]) => (
                      <div key={mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}>
                        {value} ({year})
                      </div>
                    )
                  )}
                </Tooltip>
                <Popup>
                  <strong>{mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}</strong> <br />
                  {selectedIndicators[ind]}:<br />
                  {Object.entries(indicatorData[indicator].data[instanceURL]).map(
                    ([year, value]) => (
                      <div key={mapInstanceURLtoName(adminAreaInstancesState, instanceURL)}>
                        {value} ({year})
                      </div>
                    )
                  )}
                </Popup>
              </>
            )}
          </Polygon>
        )});
        setMapPolygons((oldPolygons) => ({
          ...oldPolygons,
          [indicator]: { polygons: newPolygons, index: ind },
        }));
      });

      console.log("MAP POLYGONS", mapPolygons);

      if (!showingVisualization) {
        setShowingVisualization(true);
      }
      setBeginGeneration(false);
    }
  }, [beginGeneration, indicatorData, indicatorURLs, adminAreaInstancesState, mapPolygons, selectedIndicators, showingVisualization, years]);

  return (
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
    >
      {/* Input Form */}
      <Stack spacing={3}>
        <Header pageName={"Search Indicators"}/>

        <LocationSelect
					cityURLs={cityURLs}
					setCityURLs={setCityURLs}
					adminAreaTypesState={adminAreaTypesState}
					dispatchAdminAreaTypes={dispatchAdminAreaTypes}
					adminAreaInstancesState={adminAreaInstancesState}
					dispatchAdminAreaInstances={dispatchAdminAreaInstances}
				/>
        <JoyBox>
          <JoyBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: "20px",
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
              Indicator Information
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
                    
                    {Object.entries(selectedIndicators).map(
                      ([index, value]) => (
                        <div>
                          
                          <NewDropdown
                            key={`indicator-${index}`}
                            id="indicator-input"
                            disabled={getCurrentAdminTypeURL(adminAreaTypesState) === null}
                            label={`Indicator #${parseInt(index) + 1}`}
                            value={value}
                            options={Object.keys(indicatorURLs)}
                            onChange={(event, newValue) =>
                              handleUpdateIndicators(
                                parseInt(index),
                                newValue,
                                setSelectedIndicators
                              )
                            }
                            desc=""
                          />
                        </div>
                      )
                    )}
                    <JoyBox>
                      <JoyButton
                        sx={{ width: "25%"}}
                        variant="soft"
                        color="danger"
                        onClick={(event) => 
                          handleDeleteIndicator(years, selectedIndicators, setYears, setSelectedIndicators, setCurrentSelectedMultiIndicators)
                          
                        }
                        >
                          <DeleteIcon />
                      </JoyButton>
                      <JoyButton
                        sx={{ width: "73%", marginLeft: '2%' }}
                        variant="soft"
                        onClick={() => {
                          handleAddIndicator(
                            selectedIndicators,
                            setSelectedIndicators
                          );
                          handleAddYears(years, setYears);
                        }}
                      >
                        <AddIcon />
                        
                      </JoyButton>
                    </JoyBox>
                  </Stack>
                </JoyBox>
              </Grid>
              <Grid xs="12" md="6">
                <Stack spacing={5} sx={{ marginTop: "40px" }}>
                  {years.map(({ id, start, end }) => (
                    <JoyBox
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "40px",
                      }}
                    >
                      <NumberInput
                        id={`year1-${id}`}
                        disabled={getCurrentAdminTypeURL(adminAreaTypesState) === null}
                        label={`Starting Year ${id + 1}`}
                        onChange={(event) =>
                          handleUpdateYear(id, "start", event, years, setYears)
                        }
                        value={start}
                        desc=""
                      />
                      <NumberInput
                        id={`year2-${id}`}
                        disabled={ getCurrentAdminTypeURL(adminAreaTypesState) === null }
                        label={`Ending Year ${id + 1}`}
                        onChange={(event) =>
                          handleUpdateYear(id, "end", event, years, setYears)
                        }
                        value={end}
                        desc=""
                      />
                    </JoyBox>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </JoySheet>
        </JoyBox>
        <JoyBox
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginTop: "40px",
          }}
        >
          <JoyButton
            disabled={ getCurrentAdminTypeURL(adminAreaTypesState) === null }
            size="lg"
            color="success"
            endDecorator={<>{">"}</>}
            onClick={() =>
              handleGenerateVisualization(
                years,
                cityURLs,
                adminAreaTypesState,
                indicatorURLs,
                selectedIndicators,
                adminAreaInstancesState,
                showVisError,
                setMapPolygons,
                setShowVisError,
                setIndicatorData,
                setBeginGeneration,
                setShowingVisualization,
                setVisLoading
              )
            }
            loading={visLoading}
            loadingPosition="start"
          >
            Generate Visualization
          </JoyButton>
        </JoyBox>
      </Stack>

      {/* If there's anything incorrect, display an error */}
      {showVisError && (
        <Typography variant="h6" align="center" sx={{ color: "red" }}>
          ERROR: Could not generate visualization due to missing/improper data.
          <br />
          Please check form inputs.
        </Typography>
      )}

      {/* Show visualization only if set to show */}
      {showingVisualization && (
        <Stack spacing={3} sx={{ marginTop: 5 }}>
          <JoyBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
            }}
          >
            <JoyButton
              size="sm"
              variant="soft"
              color="danger"
              endDecorator={<CloseIcon />}
              onClick={() => setShowingVisualization(false)}
            >
              Close Visualization
            </JoyButton>
          </JoyBox>
          {/* <Button variant="outlined" size="small" sx={{width:'200px'}} onClick={() => setShowingVisualization(false)}>Close Visualization</Button> */}
          
          {/* Visualizations, one for each indicator */}
          {Object.keys(mapPolygons).map((indicator) => (
            <Paper sx={{ padding: "20px", paddingBottom: "50px" }}>
              <Stack spacing={3}>

                {/* Header - Indicator name */}
                <Typography
                  variant="h4"
                  align="center"
                  style={{
                    fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
                    fontSize: 35,
                    fontWeight: "bold",
                  }}
                  sx={{}}
                >
                  {selectedIndicators[mapPolygons[indicator].index]}
                </Typography>
                <JoyBox
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {/* Header - Save visualization button */}
                  <JoyButton
                    size="sm"
                    sx={{width:"50%"}}
                    variant="solid"
                    color="primary"
                    endDecorator={<SaveAsIcon />}
                    onClick={() => setShowingVisualization(false)}
                  >
                    Save Visualization
                  </JoyButton>
                </JoyBox>
                
                {/* Tabular visualization of desired indicator data */}
                <IndicatorTable
                  // defaultTheme={defaultTheme}
                  selectedIndicators={selectedIndicators}
                  mapPolygons={mapPolygons}
                  indicator={indicator}
                  tableColumns={tableColumns}
                  tableData={tableData}
                />

                <Grid container>

                  <Grid sm="12" md="6">
                    <JoyBox sx={{ minHeight: "100px", alignItems: 'center'}}>

                      {/* Map visualization of indicator data in desired areas*/}

                      <MapView
                        mapPolygons={mapPolygons}
                        indicator={indicator}
                      />
                    </JoyBox>
                  </Grid>

                  <Grid sm="12" md="6">
                    <Grid container sx={{ display: "flex", justifyContent: "center", textAlign: 'center', alignItems: 'center'}}>
                      <Grid sm='6' md='12' lg='6'  sx={{maxWidth: '140px', display: 'flex', justifyContent: 'center'}}>
                        <NewDropdownStateValue 
                          id={`change-graph-${indicator}-1`}
                          label="Graph Type 1"
                          options={["Bar", "Line"]}
                          disabled={false}
                          onChange={(event, newValue) => {
                            setGraphTypes((prevGraphTypes) => ({
                              ...prevGraphTypes,
                              [indicator]: newValue,
                            }));
                          }}
                          value={graphTypes[indicator] || "Bar"} // Default
                          desc=""
                        />
                      </Grid>
                      <Grid sm='6' md='12' lg='6' sx={{maxWidth: '140px' , display: 'flex', justifyContent: 'center'}}>
                        <NewDropdownStateValue
                          id={`change-graph-${indicator}-2`}
                          label="Graph Type 2"
                          options={["Area", "Pie"]}
                          disabled={false}
                          onChange={(event, newValue) => {
                            setComparisonGraphTypes(
                              (prevComparisonGraphTypes) => ({
                                ...prevComparisonGraphTypes,
                                [indicator]: newValue,
                              })
                            );
                          }}
                          value={comparisonGraphTypes[indicator] || "Area"} // Default
                          desc=""
                        />
                      </Grid>
                    </Grid>

                    <ResponsiveContainer width="100%" height={300}>
                      {graphTypes[indicator] === "Line" ? (
                        // Render LineChart based on graphTypes[indicator]
                        <LineChart
                          data={chartData[indicator]}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >

                          {getSelectedAdminInstancesNames(adminAreaInstancesState).map((instanceName, index) => (
                            <Line
                              key={instanceName} // Add a unique key for each Line
                              type="monotone"
                              dataKey={instanceName}
                              stroke={colors[index % colors.length]} // Use colors[index] to assign a color
                            />
                          ))}
                          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip />
                        </LineChart>
                      ) : (
                        <JoyBox
                          sx={{ display: "flex", justifyContent: "center", minHeight: '550px'}}
                        >
                          {/* <ActivePie data={chartData[indicator]}></ActivePie> */}
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                              width={730}
                              height={250}
                              data={chartData[indicator]}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <ChartTooltip />
                              <Legend />

                              {getSelectedAdminInstancesNames(adminAreaInstancesState).map((instanceName, index) => (
                                <Bar
                                  dataKey={instanceName}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </JoyBox>
                      )}
                    </ResponsiveContainer>

                    {/* Graph 3 is a pie chart */}
                    <JoyBox sx={{ display: "flex", justifyContent: "center" }}>
                      {comparisonGraphTypes[indicator] === "Pie" ? (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <ActivePie
                            data={handleAggregation(indicator, chartData)}
                          ></ActivePie>
                        </Box>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart
                            width={500}
                            height={400}
                            data={handleSum(indicator, chartData)}
                            margin={{
                              top: 10,
                              right: 30,
                              left: 0,
                              bottom: 0,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip />
                            {getSelectedAdminInstancesNames(adminAreaInstancesState).map((instanceName, index) => (
                              <Area
                                type="monotone"
                                dataKey={instanceName}
                                fill={colors[index % colors.length]}
                                stackId={1}
                              />
                            ))}
                            <Area
                              type="monotone"
                              dataKey="total"
                              fill="#000000"
                              stackId={1}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </JoyBox>
                  </Grid>
                </Grid>
              </Stack>
            </Paper>
          ))}
          <Grid container spacing={2} sx={{ paddingTop: "150px"}}>
            <Grid item xs={12} md={12} lg={3}>
              <JoyBox sx={{paddingTop: '15%', display: 'flex', justifyContent: 'center'}} key={selectedIndicators}>
                <NewDropdownMultiSelect
                    id="multiple-indicator-select"
                    label="Select Indicators"
                    options={Object.values(selectedIndicators)}
                    onChange={(event, newValue) => {
                      setCurrentSelectedMultiIndicators(
                        String(newValue)
                          .split(",")
                        // On autofill we get a stringified value.
                        // typeof value === 'string' ? value.split(',') : value,
                      );
                      setCurrentSelectedMultiIndicators(String(newValue).split(","));
                    }}
                    desc="Select the indicators you wish to compare."
                    currentlySelected={currentSelectedMultiIndicators}
                  />
                </JoyBox>
            </Grid>
            <Grid item xs={12} md={12} lg={9}>
              
                <JoyBox>
                <ComparisonGraph data={indicatorData} indicators={currentSelectedMultiIndicators} colors={colors}/>
              </JoyBox>
            </Grid>
          </Grid>
            
        </Stack>
      )}
    </Container>
  );
}

export default Dashboard;

