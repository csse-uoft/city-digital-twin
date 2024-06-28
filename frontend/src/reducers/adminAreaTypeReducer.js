/**
 * State type example: 
 * { currCity: "toronto", CensusTract: { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#CensusTract", selected: false }
 *   , Neighbourhood: { URL: "http://ontology.eil.utoronto.ca/Toronto/Toronto#Neighbourhood", selected: true } }
 */
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
          if (key === "currCity") {continue;}
            newState[key].selected = false;
        }
        if (action.payload === null || action.payload === "") { return newState; }
  
        if (newState.hasOwnProperty(action.payload)) {
          newState[action.payload].selected = true;
        }
        return newState;
      case "CLEAR":
        return { currCity: state.currCity };
      default:
        return {...state};
    }
  }