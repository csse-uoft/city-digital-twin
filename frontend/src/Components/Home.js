import { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import axios from "axios";

export default function Home({data, setData}) {
  const fetchCities = async () => {
    const response = await axios.get(`http://localhost:3000/api/0`);

    response.data.cityNames.forEach((URL, index) => {
      const [, cityName] = URL.split("#");
      const dataCopy = data;
      
      dataCopy.availableCities[cityName] = URL;

      setData(dataCopy);
    });
  };

  const fetchPermanentIndicatorData = async () => {
    
  };

  const fetchSavedIndicatorData = async () => {

  };

  useEffect(() => {
    fetchCities();
  }, []);

  return (
    <>
      <h1>Hello World!</h1>
    </>
  );
}