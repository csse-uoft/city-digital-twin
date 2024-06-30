import axios from "axios";
import { getCurrentAdminTypeURL, getSelectedAdminInstancesNames, getSelectedAdminInstancesURLs } from "./reducerHelpers.js";

export const handleDeleteIndicator = (years, selectedIndicators, setYears, setSelectedIndicators) => {
  var tempIndicator = { ...selectedIndicators }; // Create a shallow copy of the selectedIndicators object
  var tempYears = [...years]
  var len = Object.keys(tempIndicator).length;
  
  if (len > 1) {
    delete tempIndicator[len - 1]; // Delete the last key-value pair
    tempYears.pop()
  }

  setYears(tempYears);
  setSelectedIndicators(tempIndicator); // Set the state with the new object

}

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
    for (var y in sliced_years) {
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


export const handleGenerateVisualization = async (
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
) => {
  const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
  const selectedAdminInstancesURLs = getSelectedAdminInstancesURLs(adminAreaInstancesState);

  const checkIfInputsFilled = () => {
    return (
      typeof adminAreaTypesState["currCity"] !== "undefined" &&
      typeof currentAdminType === "string" &&
      currentAdminType !== "" &&
      selectedAdminInstancesURLs.every((instance) => {
        return typeof instance === "string" && instance !== "";
      }) &&
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

  const fetchData = async () => {
    const promises = Object.keys(selectedIndicators).map(async (index) => {
      const response = await axios.post("http://localhost:3000/api/4", {
        cityName: cityURLs[adminAreaTypesState["currCity"]],
        adminType: currentAdminType,
        adminInstance: selectedAdminInstancesURLs,
        indicatorName: indicatorURLs[selectedIndicators[index]],
        startTime: years[parseInt(index)].value1,
        endTime: years[parseInt(index)].value2,
      });

      const unitType = await axios.post("http://localhost:3000/api/5", {
        subject: indicatorURLs[selectedIndicators[index]],
        predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit",
      });

      if (unitType.data["propertyValue"].length === 0) {
        unitType.data["propertyValue"].push("NONE");
      }

      console.log(
        "final data",
        index,
        unitType.data["propertyValue"],
        response.data["indicatorDataValues"]
      );

      return {
        indicator: indicatorURLs[selectedIndicators[index]],
        data: response.data["indicatorDataValues"],
        unit: unitType.data["propertyValue"],
      };
    });

    const results = await Promise.all(promises);

    const newData = results.reduce((acc, { indicator, data, unit }) => {
      acc[indicator] = { data, unit };
      return acc;
    }, {});

    setIndicatorData((prevData) => ({
      ...prevData,
      ...newData,
    }));
  };

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
