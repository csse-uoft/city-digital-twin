import axios from "axios";
import { getCurrentAdminTypeURL, getSelectedAdminInstancesNames, getSelectedAdminInstancesURLs } from "./reducerHelpers.js";

export const handleDeleteIndicator = (years, selectedIndicators, setYears, setSelectedIndicators, setCurrentSelectedMultiIndicators) => {
  var tempIndicator = { ...selectedIndicators }; // Create a shallow copy of the selectedIndicators object
  var tempYears = [...years]
  var len = Object.keys(tempIndicator).length;
  
  if (len > 1) {
    delete tempIndicator[len - 1]; // Delete the last key-value pair
    tempYears.pop()
  }

  setYears(tempYears);
  setSelectedIndicators(tempIndicator); // Set the state with the new object
  setCurrentSelectedMultiIndicators([]);
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

// old handleGenerateVisualization method
// export const handleGenerateVisualization = async (
//   years,
//   cityURLs,
//   adminAreaTypesState,
//   indicatorURLs,
//   selectedIndicators,
//   adminAreaInstancesState,
//   showVisError,
//   setMapPolygons,
//   setShowVisError,
//   setIndicatorData,
//   setBeginGeneration,
//   setShowingVisualization,
//   setVisLoading
// ) => {
//   const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
//   const selectedAdminInstancesURLs = getSelectedAdminInstancesURLs(adminAreaInstancesState);

//   const checkIfInputsFilled = () => {
//     return (
//       typeof adminAreaTypesState["currCity"] !== "undefined" &&
//       typeof currentAdminType === "string" &&
//       currentAdminType !== "" &&
//       selectedAdminInstancesURLs.every((instance) => {
//         return typeof instance === "string" && instance !== "";
//       }) &&
//       Object.keys(selectedIndicators).every((index) => {
//         return selectedIndicators[index] !== "";
//       }) &&
//       years.every((item) => {
//         return item.value1 > 0 && item.value2 > 0;
//       })
//     );
//   };
//   setVisLoading(true);
//   setMapPolygons([]);

//   const fetchData = async () => {
//     const promises = Object.keys(selectedIndicators).map(async (index) => {
//       const response = await axios.post("http://localhost:3000/api/visualization-data", {
//         cityName: cityURLs[adminAreaTypesState["currCity"]],
//         adminType: currentAdminType,
//         adminInstance: selectedAdminInstancesURLs,
//         indicatorName: indicatorURLs[selectedIndicators[index]],
//         startTime: years[parseInt(index)].value1,
//         endTime: years[parseInt(index)].value2,
//       });

//       const unitType = await axios.post("http://localhost:3000/api/5", {
//         subject: indicatorURLs[selectedIndicators[index]],
//         predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit",
//       });

//       if (unitType.data["propertyValue"].length === 0) {
//         unitType.data["propertyValue"].push("NONE");
//       }

//       console.log(
//         "final data",
//         index,
//         unitType.data["propertyValue"],
//         response.data["indicatorDataValues"]
//       );

//       return {
//         indicator: indicatorURLs[selectedIndicators[index]],
//         data: response.data["indicatorDataValues"],
//         unit: unitType.data["propertyValue"],
//       };
//     });

//     const results = await Promise.all(promises);

//     const newData = results.reduce((acc, { indicator, data, unit }) => {
//       acc[indicator] = { data, unit };
//       return acc;
//     }, {});

//     setIndicatorData((prevData) => ({
//       ...prevData,
//       ...newData,
//     }));
//   };

//   if (checkIfInputsFilled()) {
//     if (showVisError) {
//       setShowVisError(false);
//     }

//     setIndicatorData({});

//     try {
//       // await Promise.all(
//       //   Object.keys(selectedIndicators).map(async (index) => {
//       //     const response = await axios.post("http://localhost:3000/api/visualization-data", {
//       //       cityName: cityURLs[adminURLs["currCity"]],
//       //       adminType: currentAdminType,
//       //       adminInstance: currentAdminInstances,
//       //       indicatorName: indicatorURLs[selectedIndicators[index]],
//       //       startTime: years[parseInt(index)].value1,
//       //       endTime: years[parseInt(index)].value2,
//       //     });

//       //     const unitType = await axios.post("http://localhost:3000/api/5", {
//       //       subject: indicatorURLs[selectedIndicators[index]],
//       //       predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit"
//       //     });

//       //     if (!unitType.data["propertyValue"]) {
//       //       unitType.data["propertyValue"] = "NONE";
//       //     }

//       //     console.log(
//       //       "final data",
//       //       index,
//       //       response.data["indicatorDataValues"],
//       //       unitType.data["propertyValue"]
//       //     );
//       //     // setIndicatorData((prevData) => ({
//       //     //   ...prevData,
//       //     //   [indicatorURLs[selectedIndicators[index]]]:
//       //     //     response.data["indicatorDataValues"],
//       //     // }));

//       //     setIndicatorData((prevData) => ({
//       //       ...prevData,
//       //       [indicatorURLs[selectedIndicators[index]]]:
//       //         {data: response.data["indicatorDataValues"], unit: unitType.data["propertyValue"]},
//       //     }));
//       //   })
//       // );
//       await fetchData();
//       setBeginGeneration(true);
//     } catch (error) {
//       console.error("POST Error:", error);
//     }
//   } else {
//     setShowVisError(true);
//     console.log("Can't generate visualization: missing data");
//     setShowingVisualization(false);
//   }
//   setVisLoading(false);
// };

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
  // 1) Get the chosen admin type and selected admin instance URLs.
  const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
  const selectedAdminInstances = getSelectedAdminInstancesURLs(adminAreaInstancesState);

  // 2) Define a helper function to check if all required fields are valid.
  const isInputValid = () => {
    return (
      // City must be defined
      typeof adminAreaTypesState["currCity"] !== "undefined" &&
      // Must have a valid adminType
      typeof currentAdminType === "string" &&
      currentAdminType.trim() !== "" &&
      // Each selected instance must be valid
      selectedAdminInstances.every((instance) => instance && instance.trim() !== "") &&
      // Each indicator dropdown must have a value
      Object.values(selectedIndicators).every((val) => val && val.trim() !== "") &&
      // Each year range must be valid (start > 0, end > 0, etc.)
      years.every((item) => item.value1 > 0 && item.value2 > 0)
    );
  };

  // 3) Clear old visualization data before fetching new.
  //    This makes sure the old visualization won't show while we load the new one.
  setMapPolygons({});
  setIndicatorData({});
  setShowVisError(false);
  setShowingVisualization(false);

  // 4) Start the loading indicator
  setVisLoading(true);

  // 5) If input is valid, fetch new data. Otherwise, show error.
  if (isInputValid()) {
    try {
      // Build a function that fetches the data for all selected indicators
      const fetchVisualizationData = async () => {
        const promises = Object.keys(selectedIndicators).map(async (index) => {
          // 5a) Post request to get the actual data values
          const response = await axios.post("http://localhost:3000/api/visualization-data", {
            cityName: cityURLs[adminAreaTypesState["currCity"]],
            adminType: currentAdminType,
            adminInstance: selectedAdminInstances,
            indicatorName: indicatorURLs[selectedIndicators[index]],
            startTime: years[parseInt(index)].value1,
            endTime: years[parseInt(index)].value2,
          });

          // 5b) Get the unit if available
          const unitType = await axios.post("http://localhost:3000/api/5", {
            subject: indicatorURLs[selectedIndicators[index]],
            predicate: "http://ontology.eil.utoronto.ca/ISO21972/iso21972#hasUnit",
          });

          // If there's no unit, store "NONE" so we don't break references
          if (unitType.data["propertyValue"].length === 0) {
            unitType.data["propertyValue"].push("NONE");
          }

          // 5c) Return shape: { indicator: string, data: object, unit: string[] }
          return {
            indicator: indicatorURLs[selectedIndicators[index]],
            data: response.data["indicatorDataValues"],
            unit: unitType.data["propertyValue"],
          };
        });

        const results = await Promise.all(promises);

        // 5d) Accumulate indicator data into a single object: { [indicatorUri]: { data, unit } }
        const finalData = results.reduce((acc, { indicator, data, unit }) => {
          acc[indicator] = { data, unit };
          return acc;
        }, {});

        // 5e) Replace old indicatorData state entirely with the new data
        setIndicatorData(finalData);
      };

      // 6) Invoke the fetch
      await fetchVisualizationData();

      // 7) Signal to the rest of the app that we can now build the final visualization
      setBeginGeneration(true);

      // 8) Optionally show the visualization immediately (or let your useEffect do it)
      // setShowingVisualization(true);

    } catch (error) {
      console.error("POST Error:", error);
      // If any error occurred, you can optionally show an error or hide the visualization
      setShowVisError(true);
      setShowingVisualization(false);
    }
  } else {
    // If validation failed, show error and hide visualization
    setShowVisError(true);
    setShowingVisualization(false);
    console.log("Can't generate visualization: missing or invalid data");
  }

  // 9) Stop loading indicator
  setVisLoading(false);
};