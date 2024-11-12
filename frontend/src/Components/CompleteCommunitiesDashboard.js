import { Container, Stack, Grid, Card, CardContent, Typography, Paper } from '@mui/material';
import { Box as JoyBox } from "@mui/joy";
import { Header } from './SearchPageComponents/Header';
import { useState, useEffect, useReducer } from 'react';
import { fetchCities, fetchParkData, fetchParkLocations} from '../helpers/fetchFunctions';
import LocationSelect from './OtherComponents/LocationSelect';
import { RadarChart, PolarAngleAxis, Radar, PolarGrid, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { adminAreaTypeReducer } from '../reducers/adminAreaTypeReducer';
import { adminAreaInstanceReducer } from '../reducers/adminAreaInstanceReducer';
import axios from 'axios';
import { getCurrentAdminTypeURL, getSelectedAdminInstancesURLs, getSelectedAdminInstancesNames} from '../helpers/reducerHelpers';
import { TileLayer, Circle, Popup, MapContainer } from 'react-leaflet';



const processData = (categories) => {
  return categories.map(category => {
    const data = { title: category.title };
    category.indicators.forEach(indicator => {
      data[indicator.label] = parseFloat(indicator.value);
    });
    return data;
  });
};

// Take an admin instance area URI and print out its name:
const URI_to_name = (instance_map, uri) => {
  console.log("inside the helper", uri)
  for (const name in instance_map) {
    if (instance_map[name].URL === uri) {
      return name;
    }
  }
  return null; // Return null if no matching URI is found
};


const data = [
  { lat: 43.651070, lng: -79.347015, radius: 600, color: 'green', title: 'Node 1' },
  { lat: 43.700110, lng: -79.416300, radius: 800, color: 'green', title: 'Node 2' },
  { lat: 43.681720, lng: -79.384210, radius: 400, color: 'green', title: 'Node 3' },
  { lat: 43.662890, lng: -79.395650, radius: 1200, color: 'green', title: 'Node 4' },
  { lat: 43.651890, lng: -79.381710, radius: 800, color: 'green', title: 'Node 5' },
  { lat: 43.638300, lng: -79.430120, radius: 500, color: 'green', title: 'Node 6' },
  { lat: 43.723160, lng: -79.451130, radius: 700, color: 'green', title: 'Node 7' },
  { lat: 43.687200, lng: -79.299690, radius: 900, color: 'green', title: 'Node 8' },
  { lat: 43.671590, lng: -79.287560, radius: 600, color: 'green', title: 'Node 10' },
  // Add more nodes as needed
];


const CompleteCommunitiesDashboard = ({cityURLs, setCityURLs, adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances}) => {
  const [responseData, setResponseData] = useState({});
  const [parkData, setParkData] = useState({});
  const categories = {
    'Housing': ['Average Value of Dwellings'],
    'Economy': ['Unemployment Rate', 'Average After Tax Income'],
    'Engagement': ['Participation Rate'],
    'Diversity': ['Total Ethnic Origin'],
    'Density': ['Population Density'],
    // 'Amenities': ['Parks and Leisure', 'Arts and Recreasion']

  }
  const indicatorURLs = {
    'Unemployment Rate': "http://ontology.eil.utoronto.ca/tove/cacensus#UnemploymentRate2016", 
    'Average After Tax Income': "http://ontology.eil.utoronto.ca/tove/cacensus#AverageAfterTaxIncome25Sample2016",
    'Average Value of Dwellings': "http://ontology.eil.utoronto.ca/tove/cacensus#AverageValueOfDwellings2016",
    'Participation Rate': "http://ontology.eil.utoronto.ca/tove/cacensus#ParticipationRate2016",
    'Total Ethnic Origin': "http://ontology.eil.utoronto.ca/tove/cacensus#TotalEthnicOrigin2016",
    'Population Density': "http://ontology.eil.utoronto.ca/tove/cacensus#PopulationDensity2016",
    // 'Parks and Leisure': "http://ontology.eil.utoronto.ca/tove/cacensus#31.ParksRecreationLeisureAndFitnessStudies2016",
    // 'Arts and Recreasion': "http://ontology.eil.utoronto.ca/tove/cacensus#71ArtsEntertainmentAndRecreation2016"

  }


  const [categoriesData, setCategories] = useState([
    {
      title: 'Housing',
      indicators: [
        { value: '30%', label: 'Affordable Housing' },
        { value: '1200', label: 'New Units' }
      ]
    },
    {
      title: 'Transportation',
      indicators: [
        { value: '15', label: 'Transit Stations' },
        { value: '45%', label: 'Public Transport Use' }
      ]
    },
    {
      title: 'Amenities',
      indicators: [
        { value: '25', label: 'Parks' },
        { value: '75%', label: 'Proximity to Shops' }
      ]
    },
    {
      title: 'Green Space',
      indicators: [
        { value: '40%', label: 'Urban Green Areas' },
        { value: '60%', label: 'Tree Coverage' }
      ]
    },
    {
      title: 'Economy',
      indicators: [
        { value: '5%', label: 'Unemployment Rate' },
        { value: '150000', label: 'Average After Tax Income' }
      ]
    },
    {
      title: 'Engagement',
      indicators: [
        { value: '80%', label: 'Community Participation' },
        { value: '120', label: 'Events Held' }
      ]
    },
    {
      title: 'Diversity',
      indicators: [
        { value: '65%', label: 'Cultural Diversity' },
        { value: '50', label: 'Languages Spoken' }
      ]
    },
    {
      title: 'Density',
      indicators: [
        { value: '2000', label: 'People per Sq Mile' },
        { value: '15%', label: 'Increase in Population' }
      ]
    },
    {
      title: 'Character',
      indicators: [
        { value: '85%', label: 'Historic Preservation' },
        { value: '30%', label: 'New Developments' }
      ]
    }
  ]);
  const radarData = processData(categoriesData);
  const handleUpdateCategories = () => {
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        return {
          ...category,
          indicators: category.indicators.map(indicator => {
            if (indicator.label === 'Unemployment Rate') {
              return { ...indicator, value: responseData["http://ontology.eil.utoronto.ca/tove/cacensus#UnemploymentRate2016"]['2016'] };
            }
            return indicator;
          })
        };
      });
    });
  };
  const currentAdminType = getCurrentAdminTypeURL(adminAreaTypesState);
  const selectedAdminInstancesURLs = getSelectedAdminInstancesURLs(adminAreaInstancesState);
  
  useEffect(() => {
    // cityName: cityURLs[adminAreaTypesState["currCity"]],
    //       adminType: currentAdminType,
    //       adminInstance: selectedAdminInstancesURLs,
    //       indicatorName: indicatorURLs[selectedIndicators[index]],
    //       startTime: years[parseInt(index)].value1,
    //       endTime: years[parseInt(index)].value2,
    
    
    // Make this into a helper function after its done
    
    console.log("Print Admin Area instance states", adminAreaInstancesState);
    let parkDataResults = {};
    const adminNames = getSelectedAdminInstancesNames(adminAreaInstancesState)
    const parkData = fetchParkData()
      .then(parkData => {
        
        adminNames.forEach(name=> {
          const matchedObject = parkData.data.find(obj => obj.name === name);
          console.log("Name", name)
          if (matchedObject) {
            parkDataResults[matchedObject.name] = matchedObject.value
          } else {
            console.log(`No match found for ${name}`);
          }
       });
      })
      console.log("Parkdata", parkDataResults)
      setParkData(parkDataResults)
    

    let currCity = cityURLs[adminAreaTypesState["currCity"]];

    
    



    const fetchData = async () => {
      const promises = Object.keys(indicatorURLs).map(async (key) => {
        const url = indicatorURLs[key];
        const response = await axios.post("http://localhost:3000/api/visualization-data", {
          cityName: currCity,
          adminType: currentAdminType,
          adminInstance: selectedAdminInstancesURLs,
          indicatorName: url,
          startTime: 2016,
          endTime: 2016,
        })
        return {
          indicator: url,
          data: response.data["indicatorDataValues"],
        }
      });
      return Promise.all(promises);
       
    };
    
    const getData = async () => {
      try {
        const results = await fetchData();
        const newData = results.reduce((acc, { indicator, data }) => {
          acc[indicator] = { data };
          return acc;
        }, {});
        setResponseData(newData);
        console.log("complete communities data", newData); // Use the data here
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    getData();
    // handleUpdateCategories();

    console.log("TESTINT PARK LOCATIONS", fetchParkLocations("neighborhood1"))
  }, [cityURLs, setCityURLs, adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances])

	return (
		<Container maxWidth="lg" sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}>
			<Stack spacing={3}>
				<Header pageName="Complete Communities Dashboard" />
				<LocationSelect
					cityURLs={cityURLs}
					setCityURLs={setCityURLs}
					adminAreaTypesState={adminAreaTypesState}
					dispatchAdminAreaTypes={dispatchAdminAreaTypes}
					adminAreaInstancesState={adminAreaInstancesState}
					dispatchAdminAreaInstances={dispatchAdminAreaInstances}
				/>

				<JoyBox sx={{ marginBottom: '50px' }}>
          
					<JoyBox sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
						<Typography variant="h5" style={{ fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif", fontSize: 35, fontWeight: "bold", color: "#0b2f4e" }}>
							Complete Communities Data
						</Typography>
					</JoyBox>
          {selectedAdminInstancesURLs.map((value) => (
            <JoyBox sx={{ p: 2, borderRadius: 'sm', paddingBottom: '50px', backgroundColor: '#fff', boxShadow: 1 }}>
              <Typography variant="h6" component="div">
                {URI_to_name(adminAreaInstancesState, value)}
              </Typography>
              <Grid container spacing={4}>
                {Object.keys(categories).map((categoryKey, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card sx={{ minHeight: '250px' }}>
                      <CardContent>
                        <Typography variant="h5" component="div">
                          {categoryKey}
                        </Typography>
                        {categories[categoryKey].map((indicatorLabel, i) => {
                          const indicatorURL = indicatorURLs?.[indicatorLabel];
                          const indicatorData = responseData[indicatorURL]?.data[value]?.['2016'];
                          return (
                            <JoyBox key={i} sx={{ marginTop: 2 }}>
                              <Typography variant="h6" component="div">
                                {indicatorData !== undefined ? indicatorData : 'N/A'}
                              </Typography>
                              <Typography color="text.secondary">
                                {indicatorLabel}
                              </Typography>
                            </JoyBox>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
                
                {/* Separate Park Data card as a standalone Grid item */}
                <Grid item xs={12} md={6} lg={4}>
                  <Card sx={{ minHeight: '250px' }}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        Park Data
                      </Typography>
                      <JoyBox sx={{ marginTop: 2 }}>
                        <Typography variant="h6" component="div">
                          {parkData[URI_to_name(adminAreaInstancesState, value)]}
                        </Typography>
                        <Typography color="text.secondary">
                          Park Access Score
                        </Typography>
                      </JoyBox>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </JoyBox>
          ))}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ height: '500px' }}>
              <MapContainer
                style={{ height: '100%', width: '100%' }}
                center={[43.651070, -79.347015]}
                zoom={10}
                minZoom={3}
                maxZoom={19}
                maxBounds={[[-85.06, -180], [85.06, 180]]}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution=' &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a> contributors'
                  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data.map((node, index) => (
                  <Circle
                  key={index}
                  center={[node.lat, node.lng]}
                  radius={node.radius} // Radius in meters
                  color={node.color}
                  fillOpacity={0.5}
                >
                  <Popup>
                    {node.title}
                  </Popup>
                </Circle>
                ))}
              </MapContainer>
            </Paper>
          </Grid>
          {/* <JoyBox sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
						<Typography variant="h5" style={{ fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif", fontSize: 35, fontWeight: "bold", color: "#0b2f4e" }}>
							Overall Completeness
						</Typography>
					</JoyBox>
          <JoyBox>
            <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="title" />
              <PolarRadiusAxis />
              <Radar name="Indicators" dataKey="Affordable Housing" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="New Units" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Transit Stations" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Public Transport Use" stroke="#413ea0" fill="#413ea0" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Parks" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Proximity to Shops" stroke="#413ea0" fill="#413ea0" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Urban Green Areas" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Tree Coverage" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Unemployment Rate" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="New Businesses" stroke="#413ea0" fill="#413ea0" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Community Participation" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Events Held" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Cultural Diversity" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Languages Spoken" stroke="#413ea0" fill="#413ea0" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="People per Sq Mile" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Increase in Population" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="Historic Preservation" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
              <Radar name="Indicators" dataKey="New Developments" stroke="#413ea0" fill="#413ea0" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart> 
          </JoyBox> */}
				</JoyBox>
			</Stack>
		</Container>
	);
};

export default CompleteCommunitiesDashboard;




