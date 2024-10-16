import Wkt from "wicket";
import axios from "axios";

export const fetchCities = async (setCityURLs) => {
  
  const response = await axios.get(`http://localhost:3000/api/cities`);
  // console.log("City Response", response.data)
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
      const response = await axios.post("http://localhost:3000/api/admin-types", {
        cityName: cityURLs[city],
      });
      


      // setAdminURLs({ currCity: city }); 
      dispatchAdminAreaTypes({
        type: "SET_CURRENT_CITY",
        payload: city
      });
      const adminAreaTypeURLs = {};

      // console.log("admin areas", response.data.adminAreaTypeNames);
      response.data.adminAreaTypeNames.forEach((URL, index) => {
        const [, adminName] = URL.split("#");

        adminAreaTypeURLs[adminName] = { URL: URL, selected: false };
      });

      dispatchAdminAreaTypes({
        type: "SET_URLS",
        payload: adminAreaTypeURLs
      });

    } catch (error) {
      console.error("POST Error:", error);
    }
  } 
};

export const fetchIndicators = async (setIndicatorURLs) => {
  try {
    const response = await axios.get("http://localhost:3000/api/indicators");
    
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

      const response1 = await axios.post("http://localhost:3000/api/admin-instances", {
        cityName: cityName,
        adminType: areaTypeURL,
      });

      const areaInstaceList = response1.data["adminAreaInstanceNames"];

      const response2 = await axios.post("http://localhost:3000/api/6", {
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
        areaNameToCoordsAndURL[areaName] = { URL: key, coordinates: updatedLocationURLs[key].coordinates };
      }
      // console.log("areaNameToCoords", areaNameToCoordsAndURL)
      dispatchAdminAreaInstances({
        type: "SET_COORDINATES_AND_URLS",
        payload: areaNameToCoordsAndURL
      });

      // console.log("locations", updatedLocationURLs);
    } catch (error) {
      console.error("POST Error:", error);
    }
  }
};

export const fetchCompleteCommunity = async (
  setCompleteness
) => {
  try {
    const response = await axios.get("http://localhost:3000/api/complete-community");
    console.log("reponse below")
    console.log(response);
    setCompleteness(response.data);
  } catch (error) {
    console.error("Error fetching complete community data:", error);
    throw error; // Re-throw the error if you want to handle it further up the call stack
  }
};

// instanceList is of type [{adminAreaInstance: URL, areaName: name}]
function mapAreaURLtoName(instanceList, areaURL) {
  for (const instance of instanceList) {
    if (instance.adminAreaInstance === areaURL) {
      // console.log("instance.areaName", instance.areaName)
      return instance.areaName;
    }
  }
  return null;
}