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

      if (response.data === undefined) {
        // If database returns nothing, try again
        response = await axios.post("http://localhost:3000/api/1", {
          cityName: cityURLs[city],
        });
      }
      
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
  setAreaURLs,
  setCurrentAreaNames
) => {
  setAreaURLs({});
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

      response.data["adminAreaInstanceNames"].forEach((Instance, index) => {
        setAreaURLs((prevAreaURLs) => ({
          ...prevAreaURLs,
          [Instance["areaName"]]: Instance["adminAreaInstance"],
        }));

        setCurrentAreaNames((prevCurrent) => ({
          ...prevCurrent,
          [Instance["adminAreaInstance"]]: Instance["areaName"],
        }));
      });
    } catch (error) {
      console.error("POST Error:", error);
    }
  } else {
    setAreaURLs({});
    setCurrentAreaNames({});
  }
};

export const fetchLocations = async (
  admin,
  cityURLs,
  adminAreaTypesState,
  locationURLs,
  setLocationURLs
) => {
  setLocationURLs({});
  if (admin) {
    try {
      const response = await axios.post("http://localhost:3000/api/6", {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: adminAreaTypesState[admin].URL,
      });
      console.log("list of all admin instances", response.data["adminAreaInstanceNames"]);

      const updatedLocationURLs = { ...locationURLs };
      response.data["adminAreaInstanceNames"].forEach((Instance, index) => {
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
      setLocationURLs(updatedLocationURLs);
      console.log("locations", updatedLocationURLs);
    } catch (error) {
      console.error("POST Error:", error);
    }
  } else {
    setLocationURLs({});
  }
};
export const handleSum = (indicator, chartData) => {
  let data = JSON.parse(JSON.stringify(chartData[indicator]));
  for (const yearData of data) {
    // Calculate the total for the current year
    let total = 0;

    for (const key in yearData) {
      const value = yearData[key];
      if (key === "total") {
        break;
      }
      if (key !== "name" && value !== null && !isNaN(value)) {
        total += value;
      }
    }

    // Add the 'total' property to the current year's data
    yearData.total = total;
  }
  return data;
};

export const handleAggregation = (indicator, chartData) => {
  let data = JSON.parse(JSON.stringify(chartData[indicator]));
  const aggregatedData = {};

  // Iterate through the data
  data.forEach((entry) => {
    for (const location in entry) {
      if (location !== "name") {
        // Initialize the aggregatedData object if it doesn't exist
        if (!aggregatedData[location]) {
          aggregatedData[location] = { name: location, uv: 0, value: 0 };
        }
        // Add the value to the location's total
        const value = entry[location];
        if (value !== null) {
          aggregatedData[location].uv += 1; // Increment the "uv" value by 1
          aggregatedData[location].value += value;
        }
      }
    }
  });

  // Convert aggregatedData to an array
  const aggregatedArray = Object.values(aggregatedData);
  return aggregatedArray;
};
export const handleChangeAreas = (
  event,
  setCurrentAdminInstances,
  setCurrentSelectedAreas,
  areaURLs
) => {
  setCurrentAdminInstances(
    String(event.target.value)
      .split(",")
      .map((value) => areaURLs[value])
  );
  setCurrentSelectedAreas(String(event.target.value).split(","));
};

export const handleAddIndicator = (
  selectedIndicators,
  setSelectedIndicators
) => {
  const newId = Object.keys(selectedIndicators).length;
  const newValue = "";

  const newSelectedIndicators = { ...selectedIndicators, [newId]: newValue };
  setSelectedIndicators(newSelectedIndicators);

  console.log("add indicator:", newSelectedIndicators);
};

export const handleAddYears = (years, setYears) => {
  const temp = [...years];
  temp.push({
    value1: 0,
    value2: 0,
    id: years.length,
  });
  setYears(temp);
  console.log(temp);
};

export const handleUpdateYear = (id, startOrEnd, event, years, setYears) => {
  var temp = years.slice(0, id);
  if (startOrEnd === "start") {
    temp.push({
      value1: event.target.value,
      value2: years[id].value2,
      id: id,
    });
  } else {
    temp.push({
      value1: years[id].value1,
      value2: event.target.value,
      id: id,
    });
  }
  var sliced_years = years.slice(id + 1);
  if (sliced_years.length !== 0) {
    for(var y in sliced_years){
      temp.push(sliced_years[y]);
    }
    // temp.push(years.slice(id + 1));
  }
  setYears(temp);
};

export const handleUpdateIndicators = (id, value, setSelectedIndicators) => {
  setSelectedIndicators((prevState) => ({
    ...prevState,
    [id]: value,
  }));
};

//TODO: Move this function to a more appropriate location
export const getCurrentAdminTypeURL = (adminAreaTypesState) => {
  for (const key in adminAreaTypesState) {
    if (adminAreaTypesState[key].selected) {
      return adminAreaTypesState[key].URL;
    }
  }
  return "  ";
};


export const handleGenerateVisualization = async (
  years,
  cityURLs,
  adminAreaTypesState,
  indicatorURLs,
  selectedIndicators,
  currentAdminInstances,
  showVisError,
  setMapPolygons,
  setShowVisError,
  setIndicatorData,
  setBeginGeneration,
  setShowingVisualization,
  setVisLoading
) => {
  const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);

  const checkIfInputsFilled = () => {
    return (

      typeof adminAreaTypesState["currCity"] !== "undefined" &&
      typeof currentAdminType === "string" &&
      currentAdminType !== "" &&
      currentAdminInstances.every((instance) => {
        return typeof instance === "string" && instance !== "";
      }) &&
      // typeof(currentAdminInstance) === 'string' && currentAdminInstance !== ''  &&
      Object.keys(selectedIndicators).every((index) => {
        return selectedIndicators[index] !== "";
      }) &&
      years.every((item) => {
        return item.value1 > 0 && item.value2 > 0;
      })
    );
  };
  setVisLoading(true);
  setMapPolygons([]);

  console.log("City name", cityURLs[adminAreaTypesState["currCity"]]);
  console.log("Admin type", currentAdminType);

  const fetchData = async () => {
    const promises = Object.keys(selectedIndicators).map(async (index) => {
      const response = await axios.post("http://localhost:3000/api/4", {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: currentAdminType,
        adminInstance: currentAdminInstances,
        indicatorName: indicatorURLs[selectedIndicators[index]],
        startTime: years[parseInt(index)].value1,
        endTime: years[parseInt(index)].value2,
      });
  
      const unitType = await axios.post("http://localhost:3000/api/5", {
        subject: indicatorURLs[selectedIndicators[index]],
        predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit"
      });
  
      if (unitType.data["propertyValue"].length === 0) {
        
        unitType.data["propertyValue"].push("NONE");
      }
  
      console.log(
        "final data",
        index,
        unitType.data["propertyValue"],
        response.data["indicatorDataValues"],
      );
  
      return {
        indicator: indicatorURLs[selectedIndicators[index]],
        data: response.data["indicatorDataValues"],
        unit: unitType.data["propertyValue"]
      };
    });
  
    const results = await Promise.all(promises);
  
    const newData = results.reduce((acc, { indicator, data, unit }) => {
      acc[indicator] = { data, unit };
      return acc;
    }, {});
  
    setIndicatorData((prevData) => ({
      ...prevData,
      ...newData
    }));
  }

  if (checkIfInputsFilled()) {
    if (showVisError) {
      setShowVisError(false);
    }

    setIndicatorData({});

    try {
      // await Promise.all(
      //   Object.keys(selectedIndicators).map(async (index) => {
      //     const response = await axios.post("http://localhost:3000/api/4", {
      //       cityName: cityURLs[adminURLs["currCity"]],
      //       adminType: currentAdminType,
      //       adminInstance: currentAdminInstances,
      //       indicatorName: indicatorURLs[selectedIndicators[index]],
      //       startTime: years[parseInt(index)].value1,
      //       endTime: years[parseInt(index)].value2,
      //     });

      //     const unitType = await axios.post("http://localhost:3000/api/5", {
      //       subject: indicatorURLs[selectedIndicators[index]],
      //       predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit"
      //     });

      //     if (!unitType.data["propertyValue"]) {
      //       unitType.data["propertyValue"] = "NONE";
      //     }

      //     console.log(
      //       "final data",
      //       index,
      //       response.data["indicatorDataValues"],
      //       unitType.data["propertyValue"]
      //     );
      //     // setIndicatorData((prevData) => ({
      //     //   ...prevData,
      //     //   [indicatorURLs[selectedIndicators[index]]]:
      //     //     response.data["indicatorDataValues"],
      //     // }));

      //     setIndicatorData((prevData) => ({
      //       ...prevData,
      //       [indicatorURLs[selectedIndicators[index]]]:
      //         {data: response.data["indicatorDataValues"], unit: unitType.data["propertyValue"]},
      //     }));
      //   })
      // );
      await fetchData();
      setBeginGeneration(true);
    } catch (error) {
      console.error("POST Error:", error);
    }
  } else {
    setShowVisError(true);
    console.log("Can't generate visualization: missing data");
    setShowingVisualization(false);
  }
  setVisLoading(false);
};

export const addSavedIndicator = () => {

};