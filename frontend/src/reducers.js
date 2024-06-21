import {mapAreaURLtoName} from "./helpers/fetchFunctions";


// State type example: 
// { currCity: "toronto", CensusTract: { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#CensusTract", selected: false }
//   , Neighbourhood: { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#Neighbourhood", selected: true } }
export const adminAreaTypeReducer = (state, action) => {
  const newState = {...state};
  switch (action.type) {
    case "SET_URLS":
      for (const key in action.payload) {
        const { URL, selected } = action.payload[key];
        newState[key] = { URL, selected };
      }
      return newState;
    case "SET_CURRENT_CITY":
      return { ...state, currCity: action.payload };
    case "SET_SELECTED":
      for (const key in state) {
        if (key === "currCity") {break;}
          newState[key].selected = false;
      }
      newState[action.payload].selected = true;
      return newState;
    default:
      return {...state};
  }
}


// State type example:
// { "Niagra (82)": { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood82", selected: false, 
//                    coordinates: [Array(596)]},
//    "South Riverdale (70)": { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood77", selected: true,
//                              coordinates: [Array(257)] } }
export const adminAreaInstanceReducer = (state, action) => {
  let newState = {...state};
  switch (action.type) {
    case "SET_URLS":
      for (const area in action.payload) { 
        // payload is a list of objects with keys: adminAreaInstance (this is the URL), areaName
        const { adminAreaInstance, areaName } = area;
        newState[areaName] = { URL: adminAreaInstance, selected: false, coordinates: null };
      }
      return newState;
    case "SET_COORDINATES":
      // clear the state of all entries
      newState = {};

      // payload is an object of the form { areaName: {URL, coordinates} }
      for (const key in action.payload) {
        const { URL, coordinates } = action.payload[key];
        newState[key] = { URL, coordinates: coordinates, selected: false };
      }
      return newState;
    case "SET_SELECTED":
      // set all areas to not selected
      for (const key in state) {
        newState[key].selected = {...newState[key], selected: false };
      }

      // payload is the a list of area names
      for (const areaName of action.payload) {
        newState[areaName] = { ...state[areaName], selected: true };
      }
      return newState;
    default:
      return {...state};
  }
}
