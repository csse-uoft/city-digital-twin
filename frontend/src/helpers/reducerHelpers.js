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
    if (adminAreaInstancesState[key].selected) {
      selectedAreasURLs.push(adminAreaInstancesState[key].URL);
    }
  }
  return selectedAreasURLs;
}

export const getSelectedAdminInstancesNames = (adminAreaInstancesState) => {
  const selectedAreasNames = [];
  for (const key in adminAreaInstancesState) {
      if (adminAreaInstancesState[key].selected) {
        selectedAreasNames.push(key);
      }
  }
  return selectedAreasNames;
}