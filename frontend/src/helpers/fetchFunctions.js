import Wkt from "wicket";
import axios from "axios";

export const fetchCities = async (setCityURLs) => {
  
  const response = await axios.get(`http://localhost:3000/api/0`);
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
      const response = await axios.post("http://localhost:3000/api/2", {
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

export const fetchIndicators = async (
  city,
  cityURLs,
  setIndicatorURLs
) => {
  if (city) {
    try {
      const response = await axios.post("http://localhost:3000/api/1", {
        cityName: cityURLs[city],
      });
      // console.log("indicators", response.data.indicatorNames);
      
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
  } else {
    setIndicatorURLs({});
  }
};

export const fetchArea = async (
  admin,
  cityURLs,
  adminAreaTypesState,
  setCurrentAreaNames,
  dispatchAdminAreaInstances
) => {
  setCurrentAreaNames({});
  if (admin) {
    try {
      const areaTypeURL = adminAreaTypesState[admin].URL;
      const cityName = cityURLs[adminAreaTypesState["currCity"]];

      const response = await axios.post("http://localhost:3000/api/3", {
        cityName: cityName,
        adminType: areaTypeURL,
      });
      console.log("admin instances", response.data["adminAreaInstanceNames"]);

      // dispatchAdminAreaInstances({
      //   type: "SET_URLS",
      //   payload: response.data["adminAreaInstanceNames"]
      // });

      response.data["adminAreaInstanceNames"].forEach((Instance, index) => {

        setCurrentAreaNames((prevCurrent) => ({
          ...prevCurrent,
          [Instance["adminAreaInstance"]]: Instance["areaName"],
        }));
      });
    } catch (error) {
      console.error("POST Error:", error);
    }
  } else {
    setCurrentAreaNames({});
  }
};


// TODO: Move to a more appropriate location
export function mapAreaURLtoName(instanceList, areaURL) {
  console.log("objList", instanceList)
  console.log("areaURL", areaURL)
  for (const instance of instanceList) {
    if (instance.adminAreaInstance === areaURL) {
      return instance.areaName;
    }
  }
  return null;
}

export const fetchLocations = async (
  admin,
  cityURLs,
  adminAreaTypesState,
  locationURLs,
  setLocationURLs,
  dispatchAdminAreaInstances
) => {
  setLocationURLs({});
  if (admin) {
    try {

      const areaTypeURL = adminAreaTypesState[admin].URL;
      const cityName = cityURLs[adminAreaTypesState["currCity"]];

      const response1 = await axios.post("http://localhost:3000/api/3", {
        cityName: cityName,
        adminType: areaTypeURL,
      });

      const areaInstaceList = response1.data["adminAreaInstanceNames"];


      console.log("admin instances", response1.data["adminAreaInstanceNames"]);



      const response2 = await axios.post("http://localhost:3000/api/6", {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: adminAreaTypesState[admin].URL,
      });
      console.log("list of all admin instances", response2.data["adminAreaInstanceNames"]);





      const updatedLocationURLs = { ...locationURLs };

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

      const areaNameToCoords = {};

      for (const key in updatedLocationURLs) {
        const areaName = mapAreaURLtoName(areaInstaceList, key);
        areaNameToCoords[areaName] = { URL: key, coordinates: updatedLocationURLs[key] };
      }
      console.log("areaNameToCoords", areaNameToCoords)
      dispatchAdminAreaInstances({
        type: "SET_COORDINATES",
        payload: areaNameToCoords
      });

      setLocationURLs(updatedLocationURLs);
      console.log("locations", updatedLocationURLs);
    } catch (error) {
      console.error("POST Error:", error);
    }
  } else {
    setLocationURLs({});
  }
};
