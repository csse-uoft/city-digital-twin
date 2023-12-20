import { useEffect } from "react";
import { Container, Typography } from "@mui/material";
import { Select, Option } from "@mui/joy";
import { Stack } from "@mui/joy";
import axios from "axios";
import TopBarIndicator from "./HomeDashboardComponents/TopBarIndicator";
import PermanentIndicator from "./HomeDashboardComponents/PermanentIndicator";
import TemporaryIndicator from "./HomeDashboardComponents/TemporaryIndicator";

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
      <Stack spacing={5}>
        <header>
          <Typography variant="h4" sx={{textAlign:"center", marginBottom:"10px", fontWeight:"bold", fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontSize:40}}>Indicator Dashboard</Typography>
          <Select placeholder="Select City" sx={{margin:"auto", maxWidth:"250px", marginBottom:"10px"}}>
            <Option value="City1">City1</Option>
            <Option value="City2">City2</Option>
          </Select>
          <TopBarIndicator />
        </header>

        <Stack id="permanentIndicators" spacing={1}direction="row" justifyContent="space-around" sx={{flexWrap:"wrap", rowGap:"20px"}}>
          <PermanentIndicator/>
          <PermanentIndicator/>
          <PermanentIndicator/>
        </Stack>

        <Stack id="temporaryIndicators" spacing={1}direction="row" justifyContent="space-around" sx={{flexWrap:"wrap", rowGap:"20px"}}>
          <TemporaryIndicator />
          <TemporaryIndicator />
          <TemporaryIndicator />
        </Stack>
        
      </Stack>
    </Container>
  );
}