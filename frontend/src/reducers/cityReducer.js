export const cityReducer = (state, action) => {
    let newState = {...state};
    switch (action.type) {
      case "SET_CITY":
        // clear the state of all entries
        newState = {};
  
        // payload is an object of the form { mapCoords, amenityCategories, amenitySubtypes }
        // for (const key in action.payload) {
        //   const { URL, coordinates } = action.payload[key];
        //   newState[key] = { URL, coordinates: coordinates, selected: false };
        // }
        newState.mapCoords = action.payload.mapCoords
        newState.amenityCategories = action.payload.amenityCategories
        newState.amenitySubtypes = action.payload.amenitySubtypes

        return newState;
      default:
        return {...state};
    }
  }