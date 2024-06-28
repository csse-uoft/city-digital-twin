/**  
 * State type example:
 * { "Niagra (82)": { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood82", selected: false, 
 *                    coordinates: [Array(596)]},
 *   "South Riverdale (70)": { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#neighborhood77", selected: true,
 *                              coordinates: [Array(257)] } }
*/
export const adminAreaInstanceReducer = (state, action) => {
    let newState = {...state};
    switch (action.type) {
      case "SET_COORDINATES_AND_URLS":
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
          newState[key] = {...newState[key], selected: false };
        }
  
        // payload is the a list of area names
        for (const areaName of action.payload) {
          if (newState.hasOwnProperty(areaName)) {
            newState[areaName] = { ...state[areaName], selected: true };
          }
        }
        return newState;
      default:
        return {...state};
    }
  }