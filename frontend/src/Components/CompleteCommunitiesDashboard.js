import { Container, Stack, Grid, Card, CardContent, Typography } from '@mui/material';
import { Box as JoyBox } from "@mui/joy";
import { Header } from './SearchPageComponents/Header';
import { useState, useEffect, useReducer } from 'react';
import { fetchCities} from '../helpers/fetchFunctions';
import LocationSelect from './OtherComponents/LocationSelect';
import { RadarChart, PolarAngleAxis, Radar, PolarGrid, PolarRadiusAxis, Tooltip, Legend } from 'recharts';
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

const processData = (categories) => {
  return categories.map(category => {
    const data = { title: category.title };
    category.indicators.forEach(indicator => {
      data[indicator.label] = parseFloat(indicator.value);
    });
    return data;
  });
};

const radarData = processData(categories);



const CompleteCommunitiesDashboard = ({cityURLs, setCityURLs, adminAreaTypesState, dispatchAdminAreaTypes, adminAreaInstancesState, dispatchAdminAreaInstances}) => {

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
          <JoyBox>
            <RadarChart cx={300} cy={250} outerRadius={150} width={600} height={500} data={radarData} withPolarRadiusAxis>
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
          </JoyBox>
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
