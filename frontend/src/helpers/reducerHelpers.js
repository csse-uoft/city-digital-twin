// ## AdminAreaTypesReducer helper functions
export const getCurrentAdminTypeURL = (adminAreaTypesState) => {
  for (const key in adminAreaTypesState) {
    if (adminAreaTypesState[key].selected) {
      return adminAreaTypesState[key].URL;
    }
  }
  return null;
};


// ## AdminAreaInstancesReducer helper functions
export const getSelectedAdminInstancesURLs = (adminAreaInstancesState) => {
  const selectedAreasURLs = [];
  for (const key in adminAreaInstancesState) {
    if (adminAreaInstancesState[key].selected === true) {
      selectedAreasURLs.push(adminAreaInstancesState[key].URL);
    }
  }
  console.log("selectedAreasURLs", selectedAreasURLs);
  return selectedAreasURLs;
}

export const getSelectedAdminInstancesNames = (adminAreaInstancesState) => {
  const selectedAreasNames = [];
  for (const key in adminAreaInstancesState) {
      if (adminAreaInstancesState[key].selected === true) {
        selectedAreasNames.push(key);
      }
  }
  return selectedAreasNames;
}