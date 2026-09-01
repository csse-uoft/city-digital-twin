import Wkt from "wicket";
import axios from "axios";
import { 
  setCachedAmenityCategories, 
  getCachedAmenityCategories,
  setCachedAreaAmenities,
  getCachedAreaAmenities,
  setCachedWalkabilityData,
  getCachedWalkabilityData
 } from './cacheServices'
const API_BASE_URL = process.env.REACT_APP_API_URL;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
/**
 * Test the connection to the backend server.
 *
 * Sends a GET request to the `/api/health-check` endpoint to verify if the backend is reachable.
 * Logs the result to the console and returns a boolean if successful, or `null` if the request fails.
 */


function getSubtypeMap (amenityData) {
  //console.log('creating amenity subtype map')
  const m = {}
  Object.keys(amenityData).forEach((key) => {
    amenityData[key].subtypes.forEach((subtype) => {
      m[subtype] = key
    })
  })
  //console.log('amenity subtype map: ', m)
  return m
}

function transformAmenities (amenityData) {
  //console.log('amenity: ',amenityData)
  let amenities = {}

  amenityData.forEach((amenity) => {
    const name = amenity.d?.value.split('/').at(-1)
    //console.log('name: ',name)
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
      //console.log("Backend connection successful");
      return true;
    } else {
      return false;
    }
  } catch (error) {
    //console.log("Failed to connect to backend:", error);
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
      //console.log('FETCH ADMIN AREA response: ', response)
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
    const cityURI = cityURLs[city]
    try {
      //check whether it is already cached
      //console.log('CITY URLS: ',cityURLs)
      const cachedResults = await getCachedAmenityCategories(cityURI)
      if (cachedResults && isFresh(cachedResults.timestamp)) {
        dispatchCityState({
          type:'SET_CITY',
          payload: {
            mapCoords: cachedResults.coordinates,
            amenityCategories: cachedResults.data,
            amenitySubtypes: null,
            cityURI: cachedResults.cityURI
          }
        })
      } else {
          //get map coordinates
          //console.log('making server request to get cityDetails')
          //console.log('city: ', cityURI)
          const mapCoordsResponse = await axios.post(`${API_BASE_URL}/api/map-coords`, {
            cityURI: cityURI
          })
          // //console.log('city detail map coords response: ', mapCoordsResponse)
          const mapCoords = mapCoordsResponse.data.data
          //get amenity categories
          const amenityCategoryResponse = await axios.post(`${API_BASE_URL}/api/amenity-categories`, {
            cityURI: cityURI
          })
          // //console.log('amenity cat resposne: ', amenityCategoryResponse)
          const amenityCategories = amenityCategoryResponse.data?.data

          //cache
          await setCachedAmenityCategories(cityURI, amenityCategories, mapCoords)

          // disptach to redux state
          dispatchCityState({
            type:'SET_CITY',
            payload:{
            mapCoords: mapCoords.coords,
            amenityCategories: amenityCategories,
            amenitySubtypes: null,
            cityURI: cityURI
          }
        })
      }

    } catch (err) {
      console.error('POST Error getting city details: ',err)
    }
  }
}

export const fetchAreaAmenities = async (
  areaIdentifier,
  cityURI
) => {
  // //console.log('area identifier to fetch amenities: ', areaIdentifier)
  if (areaIdentifier) {
    try {
      //check whether the amenities are already cached
      const cachedAmenities = await getCachedAreaAmenities(areaIdentifier)
      if (cachedAmenities && isFresh(cachedAmenities.timestamp)) {
        //console.log('found cached amenities')
        //dispatch results
        return cachedAmenities.data
      } else {
        //console.log('fetching area amenities')
        //make the subtype map 
        const cityDetails = await getCachedAmenityCategories(cityURI)
        const subtypeMap = getSubtypeMap(cityDetails.data)
        //make a request to the server
        const response = await axios.post(`${API_BASE_URL}/api/get-area-amenities`, {
          areaId: areaIdentifier,
          subTypeMap: subtypeMap
        })
        // //console.log('fetching area amenities response: ',response)

        //cache them
        await setCachedAreaAmenities(areaIdentifier,response.data.data,cityURI)

        //dispatch results
        return response.data.data
      }
    } catch (err) {
      console.error('POST Error getting area amenities: ',err)
    }
  }
  
}

export const fetchWalkabilityData = async (
  areaIdentifier,
  cityURI
) => {
  if (areaIdentifier) {
    try {
      const cachedWalkabilityData = await getCachedWalkabilityData(areaIdentifier)
      if (cachedWalkabilityData && isFresh(cachedWalkabilityData.timestamp)) {
        console.log('found cached walkability data of ',areaIdentifier)
        //dispatch results
        return cachedWalkabilityData.data
      } else {
        // make new request
        console.log('making server request for walkability data of',areaIdentifier)
        //get cached categories
        const cityDetails = await getCachedAmenityCategories(cityURI)

        const response = await axios.post(`${API_BASE_URL}/api/walkability-scores`, {
          areaURI: areaIdentifier,
          amenityCategories: cityDetails?.data
        })
        //console.log('fetch walkability score response:', response)

        //cache results
        //cache them
        await setCachedWalkabilityData(areaIdentifier,cityURI,response.data.data)

        // return
        return response.data.data
      }
    } catch (err) {
      console.error('POST Error getting walkability data: ',err)
      return null
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

export const fetchCityAverage = async (
  adminInstances,
  cityState
) => {
  try {
    console.log('V1 START: ', new Date().toLocaleTimeString())
    const response = await axios.post(
      `${API_BASE_URL}/api/city-average-walkability`,{
        amenityCategories: cityState.amenityCategories,
        areaURIList: Object.keys(adminInstances).map((key) => adminInstances[key].URL.split('#')[1])
      }
    )
    //given response, store in local storage
    console.log('city average data: ', response.data.data)
    sessionStorage.setItem(cityState.cityURI, JSON.stringify(response.data.data))
    //return success?
    console.log('V1 END: ', new Date().toLocaleTimeString())
    return { success: true}
  } catch (err) {
    console.error('Error fetching city average')
    return { success: false}
  }
}

// a little bit faster than fetchCityAverage
export const fetchCityAverageV2 = async (
  adminInstances,
  cityState
) => {
  try {
    console.log('V2 START: ', new Date().toLocaleTimeString())
    const areaIdList = Object.keys(adminInstances).map((key) => adminInstances[key].URL.split("#")[1])
    //initialize aggregate walkability

    //fetch
    const result = await Promise.all(areaIdList.map((id) => {
      return fetchWalkabilityData(id,cityState.cityURI)
    }))

    //initialize aggregate
    let aggWalkability = {}
    Object.keys(cityState.amenityCategories).forEach((category) => {
      aggWalkability[category] = []
    })

    //populate aggWalkability
    console.log('result: ',result)
    result.forEach((scores) => {
      if (!scores) return
      Object.keys(scores).forEach((category) => {
        const score = scores[category]?.walkability
        aggWalkability[category].push(score != null ? Number(parseFloat(score).toFixed(2)) : null)
      })
    })

    let avgWalkability = {}
    Object.keys(aggWalkability).forEach((category) => {
      const scores = aggWalkability[category].filter(k => k != null && k != undefined)
      const len = scores.length
      if (len === 0) {
          avgWalkability[category] = null
          return
      }
      const total = scores.reduce((accumulator, current) => accumulator + current, 0);
      const avg = total/len
      avgWalkability[category] = Number(avg.toFixed(2))
    })

    console.log('fetch city avg 2 walkability: ', avgWalkability)
    //now set it in session
    sessionStorage.setItem(cityState.cityURI, JSON.stringify(avgWalkability))
    console.log('V2 END: ', new Date().toLocaleTimeString())
    return { success: true}
  } catch (err) {
    console.error('Error in fetch city average v2: ',err)
    return { success: false}
  }
}

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
      //console.log('FETCH LOCATIONS response1: ',response1)
      const areaInstaceList = response1.data["adminAreaInstanceNames"];

      const response2 = await axios.post(`${API_BASE_URL}/api/6`, {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: adminAreaTypesState[admin].URL,
      });

      const updatedLocationURLs = {};
      //console.log('FETCH LOCATIONS resposne2 result: ',response2)
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
        // add the center coord
        flipped.centerCoords = Instance["centerCoords"]

        updatedLocationURLs[Instance["adminAreaInstance"]] = flipped;
      });

      const areaNameToCoordsAndURL = {};
      //console.log('UPDATED LOCATION URLS: ', updatedLocationURLs)
      for (const key in updatedLocationURLs) {
        //console.log('key:', key)
        //console.log('key value', updatedLocationURLs[key])
        const areaName = mapAreaURLtoName(areaInstaceList, key);
        //console.log('key area name: ',areaName)
        areaNameToCoordsAndURL[areaName] = {
          URL: key,
          coordinates: updatedLocationURLs[key].coordinates,
          centerCoords: updatedLocationURLs[key].centerCoords
        };
      }
      console.log('fetchLocations result: ', areaNameToCoordsAndURL)

      dispatchAdminAreaInstances({
        type: "SET_COORDINATES_AND_URLS",
        payload: areaNameToCoordsAndURL,
      });
    } catch (error) {
      console.error("fetch locations POST Error:", error);
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
    //console.log('Calling fetchAmenityLocations: ', locationID)
    const response = await axios.post(
      `${API_BASE_URL}/api/amenity-location-all`,
      {
        location_id: locationID,
      }
    );
    //console.log('/api/amenity-location-all response: ',response)

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
    //console.log('api response1: ', response1)

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
      flipped.centerCoords = Instance["centerCoords"]

      NeighborhoodLocationURLs[Instance["adminAreaInstance"]] = flipped;
    });

    const areaNameToCoordsAndURL = {};

    for (const key in NeighborhoodLocationURLs) {
      const areaName = mapAreaURLtoName(areaInstaceList, key);
      areaNameToCoordsAndURL[areaName] = {
        URL: key,
        coordinates: NeighborhoodLocationURLs[key].coordinates,
        centerCoords: NeighborhoodLocationURLs[key].centerCoords
      };
    }
    //console.log('fetchAmenityLocations response')
    //console.log('updatedLocationURLs: ', updatedLocationURLs)
    //console.log('NeighborhoodLocatoinURLs: ', NeighborhoodLocationURLs)
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
