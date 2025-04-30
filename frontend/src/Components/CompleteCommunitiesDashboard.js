import { Container, Stack, Grid, Typography } from "@mui/material";
import { CircularProgress, Box as JoyBox } from "@mui/joy";
import { Header } from "./SearchPageComponents/Header";
import { useState, useEffect } from "react";
import {
  fetchAmenityLocations,
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

/**
 * Formats a list of amenity objects into a keyed dictionary by amenity name.
 *
 * If an amenity has no name, it assigns a default name like "No name 1", "No name 2", etc.
 * The output groups each amenity under its name and includes key properties like coordinates, type, display style, and color.
 */
function formatAmenities(data) {
  const result = {};
  let unnamedCount = 0;

  data.forEach((amenity) => {
    // Determine Amenity name
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
  // REFER TO THE DOCUMENTATION PDF FOR MORE DETAILED EXPLANATION OF THE STATES

  /*
   * Holds the Radar data scores for different Amenities.
   */
  const [amenityData, setAmenityData] = useState({});

  /*
   * Stores amenity location polygon or lat/lon points as well as amenity type and colour for each a admin area instance.
   */
  const [amenityPolygons, setAmenityPolygons] = useState({});

  /*
   * Contains the polygons (outlines) for all the admin area instances.
   */
  const [locationIDPolygons, setlocationIDPolygons] = useState({});

  /*
   * Hides components while fetching information
   */
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    /*
     * Fetches the amenity scores for the radar graph.
     */
    const fetchAmenityDataResults = async () => {
      // update this if we want to query score for \
      var adminType = "";
      if (currentAdminType) {
        adminType = currentAdminType.split("#")[1];
      }

      let amenityDataResults = {}; // Store amenity data by area
      try {
        const adminNames = getSelectedAdminInstancesNames(
          adminAreaInstancesState
        );
        const data = await fetchAmenityData(adminType);

        adminNames.forEach((name) => {
          const amenitiesForArea = data.data.filter((obj) => obj.name === name);

          if (amenitiesForArea.length > 0) {
            amenitiesForArea.forEach(({ type, value }) => {
              const amenityType = type.split("#").pop();

              if (!amenityDataResults[name]) {
                amenityDataResults[name] = {};
              }
              amenityDataResults[name][amenityType] =
                parseFloat(value).toFixed(2);
            });
          }
        });

        setAmenityData(amenityDataResults);
      } catch (error) {
        console.error("Error fetching amenity data:", error);
      }
    };

    /*
     * Fetches the admin instance outlines (polygons) as well as the amenity locations
     */
    const locationIDfetchAndFormatAmenties = async () => {
      // Initialize an empty object to store all the Amenties
      setLoading(true);
      let newAmenityPolygons = {};

      for (const url of selectedAdminInstancesURLs) {
        // Extract the location_id part from the URL
        const locationID = url.split("#")[1];

        try {
          // Fetch the amenity locations for the current location_id
          const rawData = await fetchAmenityLocations(
            locationID,
            adminAreaTypesState
          );

          const amenityData = rawData[0];
          const locationIDLocationData = rawData[1];
          setlocationIDPolygons(locationIDLocationData);
          // Format the fetched Amenties using formatAmenties
          const formattedAmenities = formatAmenities(amenityData);

          // Add the formatted Amenties to the newAmenityPolygons object
          newAmenityPolygons[locationID] = formattedAmenities;
        } catch (error) {
          console.error(
            `Error fetching or formatting Amenties for ${locationID}:`,
            error
          );
        }
      }

      // Once all Amenties are fetched and formatted, update the state
      setLoading(false); // Data is ready, stop loading
      setAmenityPolygons(newAmenityPolygons);
    };

    // Call the function to fetch and format Amenties
    fetchAmenityDataResults();
    locationIDfetchAndFormatAmenties();
  }, [
    cityURLs,
    setCityURLs,
    adminAreaTypesState,
    dispatchAdminAreaTypes,
    adminAreaInstancesState,
    dispatchAdminAreaInstances,
  ]);

  // Main Component for Complete Communities Dashboard Page
  return (
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
    >
      <Stack spacing={3}>
        <Header pageName="Complete Communities Dashboard" />
        {/* Component for selecting city and admin area */}
        <LocationSelect
          cityURLs={cityURLs}
          setCityURLs={setCityURLs}
          adminAreaTypesState={adminAreaTypesState}
          dispatchAdminAreaTypes={dispatchAdminAreaTypes}
          adminAreaInstancesState={adminAreaInstancesState}
          dispatchAdminAreaInstances={dispatchAdminAreaInstances}
        />
        {/* Only render data section when areas are selected */}
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

            {/* Radar Chart showing amenities data */}
            <AmenityRadarChart amenityData={amenityData} />

            {/* Maps Section */}
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
                  // Render maps for each selected location
                  Object.keys(amenityPolygons).map((locationIDKey) => {
                    const baseURI =
                      "http://ontology.eil.utoronto.ca/Toronto/Toronto#";
                    const fullKey = baseURI + locationIDKey;
                    const locationID = amenityPolygons[locationIDKey];
                    let overlayCoords =
                      locationIDPolygons[fullKey]?.coordinates;
                    return (
                      <div>
                        {/* Location Title */}
                        <div
                          key={locationIDKey}
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

                        {/* Map Display */}
                        <div>
                          <MapContainer
                            center={[43.7, -79.42]}
                            zoom={12}
                            style={{ height: "400px", width: "100%" }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* Polygon Overlay for Location Boundary */}
                            {overlayCoords && (
                              <Polygon positions={overlayCoords} color="blue">
                                <Popup>{`Overlay for ${locationIDKey}`}</Popup>
                              </Polygon>
                            )}

                            {/* Render Amenities on the Map */}
                            {Object.entries(locationID).map(
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
                                      color={amenityObj.color || "green"}
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
