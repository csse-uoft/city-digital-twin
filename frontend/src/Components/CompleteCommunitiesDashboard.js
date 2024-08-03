import { Container, Stack, Grid, Card, Paper, CardContent, Typography } from '@mui/material';
import { Box as JoyBox } from "@mui/joy";
import { Header } from './SearchPageComponents/Header';
import { useState, useEffect, useReducer } from 'react';
import { fetchCities, fetchCompleteCommunity} from '../helpers/fetchFunctions';
import LocationSelect from './OtherComponents/LocationSelect';
import { RadarChart, PolarAngleAxis, Radar, PolarGrid, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
import { adminAreaTypeReducer } from '../reducers/adminAreaTypeReducer';
import { adminAreaInstanceReducer } from '../reducers/adminAreaInstanceReducer';
import MapView from './DataVisComponents/MapView';
import { TileLayer, Circle, Popup } from 'react-leaflet';
import { MapContainer } from 'react-leaflet';

const categories = [
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
      { value: '150', label: 'New Businesses' }
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
];

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


  const [completeness, setCompleteness] = useState([]);

  // fetch the complete community data
  useEffect(() => {
    fetchCompleteCommunity(setCompleteness);
  }, [])

  console.log(completeness);

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
							Overall Completeness
						</Typography>
					</JoyBox>
          <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} style={{ padding: '0' }}>
          <RadarChart cx={270} cy={250} outerRadius={150} width={600} height={500} data={completeness} withPolarRadiusAxis>
            <PolarGrid />
            <PolarAngleAxis dataKey="title" />
            <Radar dataKey={"completeness"} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </Paper>
      </Grid>
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
    </Grid>
					<JoyBox sx={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
						<Typography variant="h5" style={{ fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif", fontSize: 35, fontWeight: "bold", color: "#0b2f4e" }}>
							Complete Communities Data
						</Typography>
					</JoyBox>
					<JoyBox sx={{ p: 2, borderRadius: 'sm', paddingBottom: '50px', backgroundColor: '#fff', boxShadow: 1 }}>
						<Grid container spacing={4}>
							{categories.map((category, index) => (
								<Grid item xs={12} md={6} lg={4} key={index}>
									<Card>
										<CardContent>
											<Typography variant="h5" component="div">
												{category.title}
											</Typography>
											{category.indicators.map((indicator, i) => (
												<JoyBox key={i} sx={{ marginTop: 2 }}>
													<Typography variant="h6" component="div">
														{indicator.value}
													</Typography>
													<Typography color="text.secondary">
														{indicator.label}
													</Typography>
												</JoyBox>
											))}
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>
					</JoyBox>
				</JoyBox>
			</Stack>
		</Container>
	);
};

export default CompleteCommunitiesDashboard;
