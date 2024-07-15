import { Container, Stack, Grid, Card, CardContent, Typography } from '@mui/material';
import { Box as JoyBox } from "@mui/joy";
import { Header } from './SearchPageComponents/Header';
import { useState, useEffect, useReducer } from 'react';
import { fetchCities} from '../helpers/fetchFunctions';
import LocationSelect from './OtherComponents/LocationSelect';
import { adminAreaTypeReducer } from '../reducers/adminAreaTypeReducer';
import { adminAreaInstanceReducer } from '../reducers/adminAreaInstanceReducer';

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

const CompleteCommunitiesDashboard = () => {

  /*
  * City names mapped to their unique URIs.
  * Format: A dictionary (js object). 
  * Example: { toronto : "url.com/uniqueuri" }
  */
  const [cityURLs, setCityURLs] = useState({});

	// Checkout reducers.js for the state structure
  const [adminAreaTypesState, dispatchAdminAreaTypes] = useReducer(adminAreaTypeReducer, {});
  const [adminAreaInstancesState, dispatchAdminAreaInstances] = useReducer(adminAreaInstanceReducer, {});

  // Upon initial page load, fetch list of cities
  useEffect(() => {
    fetchCities(setCityURLs);
  }, []);


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
