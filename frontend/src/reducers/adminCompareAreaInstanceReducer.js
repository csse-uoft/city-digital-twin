export const adminCompareAreaInstanceReducer = (state, action) => {
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