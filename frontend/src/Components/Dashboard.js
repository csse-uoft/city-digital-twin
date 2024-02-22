import {
  Box,
  Autocomplete,
  TextField,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  createTheme,
} from "@mui/material";
import { AreaChart, Area } from "recharts";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
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
  PieChart,
  Pie,
} from "recharts";
import {
  fetchCities,
  fetchAdministration,
  fetchIndicators,
  fetchArea,
  fetchLocations,
  handleUpdateIndicators,
  handleAddIndicator,
  handleAddYears,
  handleUpdateYear,
  handleGenerateVisualization,
  handleSum,
  handleAggregation,
  handleChangeAreas,
} from "./SearchPageComponents/helper_functions";
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

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function Dashboard(savedIndicators, setDashboardData) {
  const defaultTheme = createTheme();
  // Refer to the documentation to understand each state and their purpose

  const [years, setYears] = useState([{ value1: 0, value2: 0, id: 0 }]);

  const [cities, setCities] = useState([]);
  const [cityURLs, setCityURLs] = useState({});

  const [admin, setAdmin] = useState([]);
  const [adminURLs, setAdminURLs] = useState({});

  const [area, setArea] = useState([]);
  const [areaURLs, setAreaURLs] = useState({});

  const [indicators, setIndicators] = useState([]);

  const [indicatorURLs, setIndicatorURLs] = useState({});

  const [locationURLs, setLocationURLs] = useState({});

  const [selectedIndicators, setSelectedIndicators] = useState({ 0: "" });

  const [indicatorData, setIndicatorData] = useState({});

  const [mapPolygons, setMapPolygons] = useState({});

  const [showingVisualization, setShowingVisualization] = useState(false);
  const [beginGeneration, setBeginGeneration] = useState(false);

  const [currentAdminType, setCurrentAdminType] = useState("");
  const [currentAdminInstances, setCurrentAdminInstances] = useState([]);
  const [currentAreaNames, setCurrentAreaNames] = useState({});
  const [currentSelectedAreas, setCurrentSelectedAreas] = useState([]);

  const [tableColumns, setTableColumns] = useState({});
  const [tableData, setTableData] = useState({});

  const [chartData, setChartData] = useState({});

  const [showVisError, setShowVisError] = useState(false);

  const [citySelected, setCitySelected] = useState(false);
  const [adminTypeSelected, setAdminTypeSelected] = useState(false);
  
  const [graphTypes, setGraphTypes] = useState({});
  const [comparisonGraphTypes, setComparisonGraphTypes] = useState({});

  const [visLoading, setVisLoading] = useState(false);
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

  // Upon initial page load, fetch list of cities
  useEffect(() => {
    fetchCities(setCityURLs, setCities, cities);
  }, []);

  // This useEffect is for testing and developement purposes
  useEffect(() => {
    console.log("testing", currentAreaNames);
  }, [currentAreaNames]);

  useEffect(() => {
    // Also checks if number of keys in indicatorData is equal to length of selectedIndicators - will indicate if completely done previous step
    if (
      beginGeneration &&
      Object.keys(indicatorData).length ===
        Object.keys(selectedIndicators).length
    ) {
      // const currentAreaNames = Object.fromEntries(Object.entries(areaURLs).map(([key, value]) => [value, key]));
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
          [indicator]: Object.entries(indicatorData[indicator]).map(
            ([instanceURL, data]) =>
              [currentAreaNames[instanceURL]].concat(
                Object.entries(data).map(([year, value]) => value)
              )
          ),
        }));

        // Set chart information
        const tempChartData = yearRange.map(
          (year) => {
            const res = { name: year };

            const val = Object.fromEntries(
              currentAdminInstances.map((instance) => [
                currentAreaNames[instance],
                indicatorData[indicator][instance][year],
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
          if (Object.keys(indicatorData[indicator]).indexOf(key) !== -1) {
            return "green";
          } else {
            return "red";
          }
        };

        const newPolygons = Object.keys(locationURLs).map((key) => (
          <Polygon
            key={key}
            pathOptions={{ color: itemColor(key) }}
            positions={locationURLs[key].coordinates}
          >
            {Object.keys(indicatorData[indicator]).indexOf(key) === -1 ? (
              <>
                <Tooltip sticky>
                  <strong>{currentAreaNames[key]}</strong> <br />
                  Area was not selected
                </Tooltip>
                <Popup>
                  <strong>{currentAreaNames[key]}</strong> <br />
                  Area was not selected
                </Popup>
              </>
            ) : (
              <>
                <Tooltip sticky>
                  <strong>{currentAreaNames[key]}</strong> <br />
                  {selectedIndicators[ind]}:<br />
                  {Object.entries(indicatorData[indicator][key]).map(
                    ([year, value]) => (
                      <div key={currentAreaNames[key]}>
                        {value} ({year})
                      </div>
                    )
                  )}
                </Tooltip>
                <Popup>
                  <strong>{currentAreaNames[key]}</strong> <br />
                  {selectedIndicators[ind]}:<br />
                  {Object.entries(indicatorData[indicator][key]).map(
                    ([year, value]) => (
                      <div key={currentAreaNames[key]}>
                        {value} ({year})
                      </div>
                    )
                  )}
                </Popup>
              </>
            )}
          </Polygon>
        ));
        setMapPolygons((oldPolygons) => ({
          ...oldPolygons,
          [indicator]: { polygons: newPolygons, index: ind },
        }));
      });

      if (!showingVisualization) {
        setShowingVisualization(true);
      }
      setBeginGeneration(false);
    }
  }, [indicatorData]);

  return (
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
    >
      {/* Input Form */}
      <Stack spacing={3}>
        <Header />

        <JoyBox sx={{ marginBottom: "50px" }}>
          <JoyBox
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginTop: "40px",
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
                      label="City"
                      disabled={false}
                      onChange={(event, newValue) => {
                        setCityLoading(true);
                        fetchAdministration(
                          newValue,
                          cityURLs,
                          setAdminURLs,
                          setAdmin
                        );
                        fetchIndicators(
                          newValue,
                          cityURLs,
                          setIndicatorURLs,
                          setIndicators,
                          indicators
                        );
                        setCitySelected(true);
                        setCityLoading(false);
                      }}
                      options={cities}
                      desc={
                        "Select the city which you want the indicator data for."
                      }
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
                      label="Administrative Area Type"
                      disabled={!citySelected}
                      onChange={(event, newValue) => {
                        fetchArea(
                          newValue,
                          cityURLs,
                          adminURLs,
                          setAreaURLs,
                          setArea,
                          setCurrentAreaNames
                        );
                        fetchLocations(
                          newValue,
                          cityURLs,
                          adminURLs,
                          locationURLs,
                          setLocationURLs
                        );
                        setCurrentAdminType(adminURLs[newValue]);
                        setAdminTypeSelected(true);
                      }}
                      options={admin}
                      desc="Select the demarcation type for analysis."
                    />

                    <NewDropdownMultiSelect
                      id="admin-instances-multiinput"
                      disabled={!adminTypeSelected}
                      label="Administrative Area Instances"
                      options={area}
                      onChange={(event, newValue) => {
                        setCurrentAdminInstances(
                          String(newValue)
                            .split(",")
                            .map((value) => areaURLs[value])
                          // On autofill we get a stringified value.
                          // typeof value === 'string' ? value.split(',') : value,
                        );
                        setCurrentSelectedAreas(String(newValue).split(","));
                      }}
                      desc="Select the individual demarcation areas you want to analyze."
                      currentlySelected={currentSelectedAreas}
                    />
                  </Stack>
                </JoyBox>
              </Grid>
            </Grid>
          </JoySheet>
        </JoyBox>
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
                        <NewDropdown
                          key={`indicator-${index}`}
                          id="indicator-input"
                          disabled={!adminTypeSelected}
                          label={`Indicator #${parseInt(index) + 1}`}
                          options={indicators}
                          onChange={(event, newValue) =>
                            handleUpdateIndicators(
                              parseInt(index),
                              newValue,
                              setSelectedIndicators
                            )
                          }
                          desc=""
                        />
                      )
                    )}
                    <JoyButton
                      sx={{ width: "100%" }}
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
                  </Stack>
                </JoyBox>
              </Grid>
              <Grid xs="12" md="6">
                <Stack spacing={5} sx={{ marginTop: "40px" }}>
                  {years.map(({ id, value1, value2 }) => (
                    <JoyBox
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "40px",
                      }}
                    >
                      <NumberInput
                        id={`year1-${id}`}
                        disabled={!adminTypeSelected}
                        label={`Starting Year ${id + 1}`}
                        onChange={(event) =>
                          handleUpdateYear(id, "start", event, years, setYears)
                        }
                        value={value1}
                        desc=""
                      />
                      <NumberInput
                        id={`year2-${id}`}
                        disabled={!adminTypeSelected}
                        label={`Ending Year ${id + 1}`}
                        onChange={(event) =>
                          handleUpdateYear(id, "end", event, years, setYears)
                        }
                        value={value2}
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
            disabled={!adminTypeSelected}
            size="lg"
            color="success"
            endDecorator={<>{">"}</>}
            onClick={() =>
              handleGenerateVisualization(
                years,
                cityURLs,
                adminURLs,
                indicatorURLs,
                selectedIndicators,
                currentAdminType,
                currentAdminInstances,
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

      {showVisError && (
        <Typography variant="h6" align="center" sx={{ color: "red" }}>
          ERROR: Could not generate visualization due to missing/improper data.
          <br />
          Please check form inputs.
        </Typography>
      )}

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

          {Object.keys(mapPolygons).map((indicator) => (
            <Paper sx={{ padding: "20px", paddingBottom: "50px" }}>
              <Stack spacing={3}>
              
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
                
                <IndicatorTable
                  // defaultTheme={defaultTheme}
                  selectedIndicators={selectedIndicators}
                  mapPolygons={mapPolygons}
                  indicator={indicator}
                  tableColumns={tableColumns}
                  tableData={tableData}
                />
                <Grid container>
                  <Grid sm="6">
                    <JoyBox sx={{ height: "100px" }}>
                      <MapView
                        mapPolygons={mapPolygons}
                        indicator={indicator}
                      />
                    </JoyBox>
                  </Grid>
                  <Grid sm="6">
                    <JoyBox sx={{ display: "flex", justifyContent: "center" }}>
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
                      <JoyBox sx={{ paddingLeft: "10%" }}></JoyBox>
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
                    </JoyBox>
                    <ResponsiveContainer width="100%" height={300}>
                      {graphTypes[indicator] === "Line" ? (
                        // Render LineChart based on graphTypes[indicator]
                        <LineChart
                          data={chartData[indicator]}
                          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                        >
                          {currentAdminInstances.map((instance, index) => (
                            <Line
                              key={instance} // Add a unique key for each Line
                              type="monotone"
                              dataKey={currentAreaNames[instance]}
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
                          sx={{ display: "flex", justifyContent: "center" }}
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

                              {currentAdminInstances.map((instance, index) => (
                                <Bar
                                  dataKey={currentAreaNames[instance]}
                                  fill={colors[index % colors.length]}
                                />
                              ))}
                            </BarChart>
                          </ResponsiveContainer>
                        </JoyBox>
                      )}
                    </ResponsiveContainer>
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
                            {currentAdminInstances.map((instance, index) => (
                              <Area
                                type="monotone"
                                dataKey={currentAreaNames[instance]}
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
        </Stack>
      )}
    </Container>
  );
}

export default Dashboard;
