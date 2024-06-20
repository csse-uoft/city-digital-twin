// ## AdminAreaTypesReducer helper functions
export const getCurrentAdminTypeURL = (adminAreaTypesState) => {
  for (const key in adminAreaTypesState) {
    if (adminAreaTypesState[key].selected) {
      return adminAreaTypesState[key].URL;
    }
  }
  return null;
};