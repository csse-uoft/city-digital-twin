import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL ;

export const fetchCities = async (data, setData) => {
  const response = await axios.get(`${API_BASE_URL}/api/0`);
  const tempDashData = {...data};
  tempDashData.availableCities = {};

  response.data.cityNames.forEach((URL, index) => {
      const [, cityName] = URL.split("#");
      tempDashData.availableCities[index] = {name:cityName, URI:URL};
  });

  setData(tempDashData);
  console.log("tempDashData: ", tempDashData);
};

export const fetchPermanentIndicatorData = async (data, setData) => {
    
};

export const fetchSavedIndicatorData = async (data, setData) => {
  
};