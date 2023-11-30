import { useState, useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { Select, Option } from "@mui/joy";
import { Box, Stack } from "@mui/joy";
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
    <Container
      maxWidth="lg"
      sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
    >
      <Stack spacing={3}>
        <header>
          <Typography variant="h4" sx={{fontWeight: "bold"}}>Dashboard</Typography>
          <Select placeholder="Select City" sx={{maxWidth:"250px"}}>
            <Option value="City1">City1</Option>
            <Option value="City2">City2</Option>
          </Select>
        </header>

        <Box>
          <h1>Hello!</h1>
        </Box>
      </Stack>
      
      
    </Container>
  );
}