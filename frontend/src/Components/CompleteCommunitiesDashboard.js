import { Container, Stack, Grid, Typography } from "@mui/material";
import { CircularProgress, Box as JoyBox } from "@mui/joy";
import { Header } from "./SearchPageComponents/Header";
import { useState, useEffect } from "react";
import {
  fetchAmenityLocations,
  fetchAllAmenity,
  testBackendConnection,
  fetchAmenityData,
} from "../helpers/fetchFunctions";
import LocationSelect from "./OtherComponents/LocationSelect";

import "leaflet/dist/leaflet.css";
import {
  getCurrentAdminTypeURL,
  getSelectedAdminInstancesURLs,
  getSelectedAdminInstancesNames,
} from "../helpers/reducerHelpers";
import { TileLayer, Popup, MapContainer, Polygon, Marker } from "react-leaflet";
import AmenityRadarChart from "./DataVisComponents/AmenityRadarChart";

// Take an admin instance area URI and print out its name:
const URI_to_name = (instance_map, uri) => {
  for (const name in instance_map) {
    if (instance_map[name].URL === uri) {
      return name;
    }
  }
  return null; // Return null if no matching URI is found
};

function formatAmenities(data, neighborhood) {
  const result = {};
  let unnamedCount = 0;

  data.forEach((amenity) => {
    // Determine park name
    let name = amenity.name;
    if (!name) {
      unnamedCount += 1;
      name = `No name ${unnamedCount}`;
    }
    result[name] = {
      coordinates: amenity.coords.coordinates,
      amenityType: amenity.amenityType,
      displayType: amenity.displayType,
      url: amenity.rootURL,
      color: amenity.color,
    };
  });

  return result;
}

const CompleteCommunitiesDashboard = ({
  cityURLs,
  setCityURLs,
  adminAreaTypesState,
  dispatchAdminAreaTypes,
  adminAreaInstancesState,
  dispatchAdminAreaInstances,
}) => {
  const [amenityData, setAmenityData] = useState({});
  const [parkPolygons, setParkPolygons] = useState({});
  const [neighborhoodPolygons, setNeighborhoodPolygons] = useState({});
  const [AmenityURLs, setAmenityURLs] = useState([]); // Store fetched Amenity URLs
  const [AmenityColor, setAmenityColor] = useState({}); // Store URL-color mapping
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrls = async () => {
      fetchAllAmenity(setAmenityURLs, setAmenityColor);
    };
    fetchUrls();
    const checkBackend = async () => {
      console.log("Checking backend connection...");
      const result = await testBackendConnection();
      if (!result) {
        alert(
          "Could not connect to the backend. Please check your connection."
        );
      }
    };
    checkBackend();
  }, []);

  const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
  const selectedAdminInstancesURLs = getSelectedAdminInstancesURLs(
    adminAreaInstancesState
  );

  useEffect(() => {
    console.log("Current Admin Type", currentAdminType);
    console.log("Current City", cityURLs);
    console.log("Print Admin Area instance states", adminAreaInstancesState);

    const fetchAmenityDataResults = async () => {
      let amenityDataResults = {}; // Store amenity data by area
      try {
        const adminNames = getSelectedAdminInstancesNames(
          adminAreaInstancesState
        );
        const data = await fetchAmenityData();

        adminNames.forEach((name) => {
          const amenitiesForArea = data.data.filter((obj) => obj.name === name);
          console.log("Testing, testing 1", amenitiesForArea);
          if (amenitiesForArea.length > 0) {
            amenitiesForArea.forEach(({ type, value }) => {
              console.log("Testing, testing", type);
              const amenityType = type.split("#").pop();

              if (!amenityDataResults[name]) {
                amenityDataResults[name] = {};
              }
              amenityDataResults[name][amenityType] =
                parseFloat(value).toFixed(2);
            });
          }
        });
        console.log("Amenity data", amenityDataResults);
        setAmenityData(amenityDataResults);
      } catch (error) {
        console.error("Error fetching amenity data:", error);
      }
    };

    const fetchAndFormatParks = async () => {
      // Initialize an empty object to store all the parks
      setLoading(true);
      let newParkPolygons = {};

      for (const url of selectedAdminInstancesURLs) {
        // Extract the neighborhood part from the URL
        const neighborhood = url.split("#")[1];

        try {
          // Fetch the park locations for the current neighborhood
          const rawData = await fetchAmenityLocations(
            neighborhood,
            adminAreaTypesState
          );

          // console.log("**** FORMAT FOR PARK LOCATIONS", rawData)
          const amenityData = rawData[0];
          const neighborhoodLocationData = rawData[1];
          setNeighborhoodPolygons(neighborhoodLocationData);
          // Format the fetched parks using formatParks
          const formattedAmenities = formatAmenities(amenityData);
          // console.log("formatParks, ", formattedAmenities)
          // Add the formatted parks to the newParkPolygons object
          newParkPolygons[neighborhood] = formattedAmenities;
        } catch (error) {
          console.error(
            `Error fetching or formatting parks for ${neighborhood}:`,
            error
          );
        }
      }

      // Once all parks are fetched and formatted, update the state
      setLoading(false); // Data is ready, stop loading
      setParkPolygons(newParkPolygons);
    };

    // Call the function to fetch and format parks
    fetchAmenityDataResults();
    fetchAndFormatParks();
  }, [
    cityURLs,
    setCityURLs,
    adminAreaTypesState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchAdminAreaInstances,
  ]);

  useEffect(() => {
    // Log the parkPolygons state whenever it changes
    console.log("Updated park polygons:", parkPolygons);
  }, [parkPolygons]); // This will run whenever parkPolygons changes
  return (
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
    >
      <Stack spacing={3}>
        <Header pageName="Complete Communities Dashboard" />
        <LocationSelect
          cityURLs={cityURLs}
          setCityURLs={setCityURLs}
          adminAreaTypesState={adminAreaTypesState}
          dispatchAdminAreaTypes={dispatchAdminAreaTypes}
          adminAreaInstancesState={adminAreaInstancesState}
          dispatchAdminAreaInstances={dispatchAdminAreaInstances}
        />
        {selectedAdminInstancesURLs.length > 0 ? (
          <JoyBox sx={{ marginBottom: "50px" }}>
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
                Complete Communities Data
              </Typography>
            </JoyBox>

            <AmenityRadarChart amenityData={amenityData} />

            <Grid item xs={12} md={6} style={{ marginTop: "8%" }}>
              <div>
                {loading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      textAlign: "center",
                      marginTop: "20px",
                    }}
                  >
                    <Typography variant="h6">Loading maps </Typography>
                    <CircularProgress />
                  </div>
                ) : (
                  Object.keys(parkPolygons).map((neighborhoodKey) => {
                    const baseURI =
                      "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
                    const fullKey = baseURI + neighborhoodKey;
                    const neighborhood = parkPolygons[neighborhoodKey];
                    let overlayCoords =
                      neighborhoodPolygons[fullKey]?.coordinates;
                    return (
                      <div>
                        <div
                          key={neighborhoodKey}
                          style={{
                            marginBottom: "20px",
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "5%",
                          }}
                        >
                          <Typography variant="h4" component="div">
                            {URI_to_name(adminAreaInstancesState, fullKey)}
                          </Typography>
                        </div>
                        <div>
                          <MapContainer
                            center={[43.7, -79.42]}
                            zoom={12}
                            style={{ height: "400px", width: "100%" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {overlayCoords && (
                              <Polygon positions={overlayCoords} color="blue">
                                <Popup>{`Overlay for ${neighborhoodKey}`}</Popup>
                              </Polygon>
                            )}

                            {Object.entries(neighborhood).map(
                              ([amenityName, amenityObj]) => {
                                if (amenityObj.displayType === "Point") {
                                  return (
                                    <Marker
                                      key={amenityName}
                                      position={[
                                        amenityObj.coordinates[0],
                                        amenityObj.coordinates[1],
                                      ]}
                                    >
                                      <Popup>{amenityName}</Popup>
                                    </Marker>
                                  );
                                } else if (
                                  amenityObj.displayType === "Polygon"
                                ) {
                                  return (
                                    <Polygon
                                      key={amenityName}
                                      positions={amenityObj.coordinates}
                                      color={
                                        amenityObj.color ||
                                        AmenityColor[amenityObj.url] ||
                                        "green"
                                      }
                                    >
                                      <Popup>{amenityName}</Popup>
                                    </Polygon>
                                  );
                                }
                                return null;
                              }
                            )}
                          </MapContainer>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Grid>
          </JoyBox>
        ) : (
          <div></div>
        )}
      </Stack>
    </Container>
  );
};

export default CompleteCommunitiesDashboard;
