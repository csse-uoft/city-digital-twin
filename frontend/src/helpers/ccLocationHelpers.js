const API_BASE_URL = process.env.REACT_APP_API_URL ;


export const fetchParkLocations = async (
    neighborhoodName
  ) => {
      try {
  
        const response = await axios.post(`${API_BASE_URL}/api/park-locations`, {
          neighborhoodName: neighborhoodName
        });
        
        const updatedLocationURLs = [];
        console.log("PRINT RAW DATA", response)
        // this extracts the cooridnates into the updatedLocationURLs variable
        
        response.data.data.forEach((Instance, index) => {
          console.log("Inside the loop", Instance)
          var wkt = new Wkt.Wkt();
          wkt.read(Instance.coordinates);
  
          var flipped = wkt.toJson();
  
          // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
          // The code requires Lat/Lon, so flip it back.
  
          if (flipped.type === "Polygon") {
            flipped.coordinates = flipped.coordinates.map((innerArray) =>
              innerArray.map((coords) => [coords[1], coords[0]])
            );
  
          } else if (flipped.type === "Point"){
            flipped.coordinates = [flipped.coordinates[1], flipped.coordinates[0]];
          
          } else {
            // flipped is a MULTIpolygon
            flipped.coordinates = flipped.coordinates.map((firstInnerArray) => 
              firstInnerArray.map((secondInnerArray) => 
                secondInnerArray.map((coords) => [coords[1], coords[0]])
              )
            );
          }
          
          updatedLocationURLs.push({ name: Instance.name, coords: flipped });
        });
  
  
  
        const cityName = 'http://ontology.eil.utoronto.ca/Toronto/Toronto#toronto';
        const areaTypeURL = 'http://ontology.eil.utoronto.ca/Toronto/Toronto#Neighborhood'
  
  
        const response1 = await axios.post(`${API_BASE_URL}/api/admin-instances`, {
          cityName: cityName,
          adminType: areaTypeURL,
        });
  
        const areaInstaceList = response1.data["adminAreaInstanceNames"];
  
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
          areaNameToCoordsAndURL[areaName] = { URL: key, coordinates: NeighborhoodLocationURLs[key].coordinates };
        }
        
        return [updatedLocationURLs, NeighborhoodLocationURLs];
  
        // const areaNameToCoordsAndURL = {};
  
        // for (const key in updatedLocationURLs) {
        //   const areaName = mapAreaURLtoName(areaInstaceList, key);
        //   areaNameToCoordsAndURL[areaName] = { URL: key, coordinates: updatedLocationURLs[key].coordinates };
        // }
        // // console.log("areaNameToCoords", areaNameToCoordsAndURL)
        // dispatchAdminAreaInstances({
        //   type: "SET_COORDINATES_AND_URLS",
        //   payload: areaNameToCoordsAndURL
        // });
  
        // console.log("locations", updatedLocationURLs);
      } catch (error) {
        console.error("POST Error:", error);
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
  
