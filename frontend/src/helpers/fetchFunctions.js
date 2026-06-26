import Wkt from "wicket";
import axios from "axios";
import { setCachedAmenityCategories, getCachedAmenityCategories } from './cacheServices'

const API_BASE_URL = process.env.REACT_APP_API_URL;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
/**
 * Test the connection to the backend server.
 *
 * Sends a GET request to the `/api/health-check` endpoint to verify if the backend is reachable.
 * Logs the result to the console and returns a boolean if successful, or `null` if the request fails.
 */

function transformAmenities (amenityData) {
  console.log('amenity: ',amenityData)
  let amenities = {}

  amenityData.forEach((amenity) => {
    const name = amenity.d?.value.split('/').at(-1)
    console.log('name: ',name)
    const colour = amenity?.colour?.value
    const iconUrl = amenity?.icon?.value
    if (name) {

      amenities[name] = {
        colour: colour,
        icon: iconUrl
      }
    }
    
  })

  return amenities
}

function isFresh (timestamp) {
  return Date.now() - timestamp < CACHE_TTL;
}

export const testBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/health-check`);
    if (response.data.success) {
      console.log("Backend connection successful");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log("Failed to connect to backend:", error);
    return false;
  }
};

export const fetchCities = async (setCityURLs) => {
  const response = await axios.get(`${API_BASE_URL}/api/cities`);

  response.data.cityNames.forEach((URL, index) => {
    const [, cityName] = URL.split("#");

    setCityURLs((prevCityURLs) => ({
      ...prevCityURLs,
      [cityName]: URL,
    }));
  });
};

export const fetchAdministration = async (
  city,
  cityURLs,
  dispatchAdminAreaTypes
) => {
  if (city) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin-types`, {
        cityName: cityURLs[city],
      });

      dispatchAdminAreaTypes({
        type: "SET_CURRENT_CITY",
        payload: city,
      });
      const adminAreaTypeURLs = {};

      response.data.adminAreaTypeNames.forEach((URL, index) => {
        const [, adminName] = URL.split("#");

        adminAreaTypeURLs[adminName] = { URL: URL, selected: false };
      });

      dispatchAdminAreaTypes({
        type: "SET_URLS",
        payload: adminAreaTypeURLs,
      });
    } catch (error) {
      console.error("POST Error:", error);
    }
  }
};

export const fetchCityDetails = async (
  city,
  cityURLs,
  dispatchCityState
) => {
  if (city) {
    try {
      //check whether it is already cached
      const cachedResults = await getCachedAmenityCategories(cityURLs[city])
      if (cachedResults && isFresh(cachedResults.timestamp)) {
        dispatchCityState({
          type:'SET_CITY',
          payload: {
            mapCoords: cachedResults.coordinates,
            amenityCategories: cachedResults.data,
            amenitySubtypes: null
          }
        })
      } else {
          //get map coordinates
          console.log('making server request to get cityDetails')
          console.log('city: ', cityURLs[city])
          const mapCoordsResponse = await axios.post(`${API_BASE_URL}/api/map-coords`, {
            cityURI: cityURLs[city]
          })
          const mapCoords = mapCoordsResponse.data.data
          //get amenity categories
          const amenityCategoryResponse = await axios.post(`${API_BASE_URL}/api/amenity-categories`, {
            cityURI: cityURLs[city]
          })
          console.log('amenity cat resposne: ', amenityCategoryResponse)
          const amenityCategories = amenityCategoryResponse.data?.data

          //cache
          await setCachedAmenityCategories(cityURLs[city], amenityCategories, mapCoords)

          // disptach to redux state
          dispatchCityState({
            type:'SET_CITY',
            payload:{
            mapCoords: mapCoords,
            amenityCategories: amenityCategories,
            amenitySubtypes: null
          }
        })
      }

    } catch (err) {
      console.error('POST Error getting city details: ',err)
    }
  }
}

export const fetchIndicators = async (setIndicatorURLs) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/indicators`);

    response.data.indicatorNames.forEach((URL, index) => {
      const [, indName] = URL.split("#");

      setIndicatorURLs((prevIndicatorURLs) => ({
        ...prevIndicatorURLs,
        [indName]: URL,
      }));
    });
  } catch (error) {
    console.error("POST Error:", error);
  }
};

export const fetchLocations = async (
  admin,
  cityURLs,
  adminAreaTypesState,
  dispatchAdminAreaInstances
) => {
  if (admin) {
    try {
      const areaTypeURL = adminAreaTypesState[admin].URL;
      const cityName = cityURLs[adminAreaTypesState["currCity"]];

      const response1 = await axios.post(
        `${API_BASE_URL}/api/admin-instances`,
        {
          cityName: cityName,
          adminType: areaTypeURL,
        }
      );

      const areaInstaceList = response1.data["adminAreaInstanceNames"];

      const response2 = await axios.post(`${API_BASE_URL}/api/6`, {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: adminAreaTypesState[admin].URL,
      });

      const updatedLocationURLs = {};

      // this extracts the cooridnates into the updatedLocationURLs variable
      response2.data["adminAreaInstanceNames"].forEach((Instance, index) => {
        var wkt = new Wkt.Wkt();
        wkt.read(Instance["areaLocation"]);

        var flipped = wkt.toJson();

        // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
        // The code requires Lat/Lon, so flip it back.

        if (flipped.type === "Polygon") {
          flipped.coordinates = flipped.coordinates.map((innerArray) =>
            innerArray.map((coords) => [coords[1], coords[0]])
          );
        } else {
          // flipped is a MULTIpolygon
          flipped.coordinates = flipped.coordinates.map((firstInnerArray) =>
            firstInnerArray.map((secondInnerArray) =>
              secondInnerArray.map((coords) => [coords[1], coords[0]])
            )
          );
        }

        updatedLocationURLs[Instance["adminAreaInstance"]] = flipped;
      });

      const areaNameToCoordsAndURL = {};

      for (const key in updatedLocationURLs) {
        const areaName = mapAreaURLtoName(areaInstaceList, key);
        areaNameToCoordsAndURL[areaName] = {
          URL: key,
          coordinates: updatedLocationURLs[key].coordinates,
        };
      }
      console.log('fetchLocations result: ', areaNameToCoordsAndURL)

      dispatchAdminAreaInstances({
        type: "SET_COORDINATES_AND_URLS",
        payload: areaNameToCoordsAndURL,
      });
    } catch (error) {
      console.error("POST Error:", error);
    }
  }
};

/**
 * Fetches amenity locations for a given location (neighborhood) and admin area type,
 * processes their geometries, and returns structured coordinate data.
 *
 * This function performs the following:
 * 1. Sends a POST request to fetch amenities that intersect with the specified location.
 * 2. Converts WKT coordinates to GeoJSON and flips them (Lon/Lat → Lat/Lon).
 * 3. Sends additional requests to get admin area instance names and geometry.
 * 4. Flips and maps those geometries into a dictionary of areaName → { URL, coordinates }.
 *
 * @async
 * @function fetchAmenityLocations
 * @param {string} location_id - The location/neighborhood identifier (e.g., "neighborhood70").
 * @param {Object} adminAreaTypesState - The frontend state object holding selected administrative area types and their URLs.
 * @returns {Promise<[Array<Object>, Object]>} A tuple:
 *   - `updatedLocationURLs`: Array of amenity objects with name, coordinates, amenityType, color, and geometry type.
 *   - `NeighborhoodLocationURLs`: Object mapping area instance URIs to flipped coordinate geometries.
 *
 * @example
 * const [amenities, areas] = await fetchAmenityLocations("neighborhood70", adminAreaTypesState);
 */
export const fetchAmenityLocations = async (
  locationID,
  adminAreaTypesState
) => {
  try {
    console.log('Calling fetchAmenityLocations: ', locationID)
    const response = await axios.post(
      `${API_BASE_URL}/api/amenity-location-all`,
      {
        location_id: locationID,
      }
    );
    console.log('/api/amenity-location-all response: ',response)

    const updatedLocationURLs = [];

    // this extracts the cooridnates into the updatedLocationURLs variable

    response.data.data.forEach((Instance, index) => {
      var wkt = new Wkt.Wkt();
      wkt.read(Instance.coordinates);

      var flipped = wkt.toJson();

      // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
      // The code requires Lat/Lon, so flip it back.
      var displayT = "";
      if (flipped.type === "Polygon") {
        flipped.coordinates = flipped.coordinates.map((innerArray) =>
          innerArray.map((coords) => [coords[1], coords[0]])
        );
        displayT = "Polygon";
      } else if (flipped.type === "Point") {
        displayT = "Point";

        flipped.coordinates = [flipped.coordinates[1], flipped.coordinates[0]];
      } else if (flipped.type === "MultiPolygon") {
        // flipped is a MULTIpolygon
        flipped.coordinates = flipped.coordinates.map((firstInnerArray) =>
          firstInnerArray.map((secondInnerArray) =>
            secondInnerArray.map((coords) => [coords[1], coords[0]])
          )
        );
      }

      updatedLocationURLs.push({
        name: Instance.name,
        coords: flipped,
        amenityType: Instance.amenityType,
        rootURL: Instance.type,
        color: Instance.color,
        displayType: displayT,
      });
    });

    // 2. Retrieve admin area info based on selected area type
    const cityName = "http://ontology.eil.utoronto.ca/Toronto/Toronto#toronto";

    const getSelectedURL = (obj) => {
      for (const key in obj) {
        if (obj[key]?.selected === true) {
          return obj[key].URL;
        }
      }
    };

    const areaTypeURL = getSelectedURL(adminAreaTypesState);

    // Get admin area instance names
    const response1 = await axios.post(`${API_BASE_URL}/api/admin-instances`, {
      cityName: cityName,
      adminType: areaTypeURL,
    });
    console.log('api response1: ', response1)

    const areaInstaceList = response1.data["adminAreaInstanceNames"];

    // Get geometry (WKT) of those admin area instances
    const response2 = await axios.post(`${API_BASE_URL}/api/6`, {
      cityName: cityName,
      adminType: areaTypeURL,
    });
    const NeighborhoodLocationURLs = {};

    // this extracts the cooridnates into the updatedLocationURLs variable
    response2.data["adminAreaInstanceNames"].forEach((Instance, index) => {
      var wkt = new Wkt.Wkt();
      wkt.read(Instance["areaLocation"]);

      var flipped = wkt.toJson();

      // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
      // The code requires Lat/Lon, so flip it back.

      if (flipped.type === "Polygon") {
        flipped.coordinates = flipped.coordinates.map((innerArray) =>
          innerArray.map((coords) => [coords[1], coords[0]])
        );
      } else {
        // flipped is a MULTIpolygon
        flipped.coordinates = flipped.coordinates.map((firstInnerArray) =>
          firstInnerArray.map((secondInnerArray) =>
            secondInnerArray.map((coords) => [coords[1], coords[0]])
          )
        );
      }

      NeighborhoodLocationURLs[Instance["adminAreaInstance"]] = flipped;
    });

    const areaNameToCoordsAndURL = {};

    for (const key in NeighborhoodLocationURLs) {
      const areaName = mapAreaURLtoName(areaInstaceList, key);
      areaNameToCoordsAndURL[areaName] = {
        URL: key,
        coordinates: NeighborhoodLocationURLs[key].coordinates,
      };
    }
    console.log('fetchAmenityLocations response')
    console.log('updatedLocationURLs: ', updatedLocationURLs)
    console.log('NeighborhoodLocatoinURLs: ', NeighborhoodLocationURLs)
    return [updatedLocationURLs, NeighborhoodLocationURLs];
  } catch (error) {
    console.error("POST Error:", error);
  }
};

// instanceList is of type [{adminAreaInstance: URL, areaName: name}]
function mapAreaURLtoName(instanceList, areaURL) {
  for (const instance of instanceList) {
    if (instance.adminAreaInstance === areaURL) {
      return instance.areaName;
    }
  }
  return null;
}

/**
 * Fetches amenity score data from the backend API.
 *
 * Sends a POST request to the `/api/amenity-score` endpoint.
 * This endpoint is expected to return a structured response containing
 * amenity scores for various neighborhoods or regions.
 *
 * NOTE, it only fetch score for neighbourhood for now
 */
export const fetchAmenityData = async (adminType) => {
  const response = await axios.post(`${API_BASE_URL}/api/amenity-score`, {
    adminType: adminType,
  });

  return response;
};
