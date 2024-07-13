import { Container, Stack, Grid, Card, CardContent, Typography } from '@mui/material';
import { Sheet as JoySheet } from "@mui/joy";
import { Box as JoyBox } from "@mui/joy";


import { Header } from './SearchPageComponents/Header';
import { useState, useEffect } from 'react';
import { NewDropdown } from './SearchPageComponents/NewDropdown';

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
    return (
        <Container
            maxWidth="lg"
            sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}
        >
            <Header pageName="Complete Communities Dashboard" />
            <Stack spacing={3}>
                <JoyBox sx={{ textAlign: 'center', marginBottom: '50px' }}>
                    <JoyBox
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '40px',
                            marginBottom: '20px',
                        }}
                    >
                        <Typography
                            variant="h5"
                            style={{
                                fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
                                fontSize: 35,
                                fontWeight: "bold",
                                color: "#0b2f4e",
                            }}
                        >
                            City Overview
                        </Typography>
                    </JoyBox>
                    <JoySheet
                        variant="outlined"
                        sx={{ p: 2, borderRadius: "sm", paddingBottom: "50px" }}
                    >
                        <Grid container>
                            <Grid xs="12" md="6">
                                <JoyBox
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "40px",
                                    }}
                                >
                                    <Stack spacing={5}>
                                        <NewDropdown
                                            label="City"
                                            options={[]}
                                            desc="Select the city which you want the indicator data for."
                                            disabled={false}
                                            onChange={() => {}}
                                            id=""
                                            isLoading={false}
                                        />
                                    </Stack>
                                </JoyBox>
                            </Grid>
                            <Grid xs="12" md="6">
                                <JoyBox
                                    sx={{
                                        width: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        marginTop: "40px",
                                    }}
                                >
                                    <Stack spacing={5}>
                                        <NewDropdown
                                            label="Administrative Area"
                                            options={[]}
                                            desc="Select the demarcation type for analysis."
                                            disabled={false}
                                            onChange={() => {}}
                                            id=""
                                            isLoading={false}
                                        />
                                        <NewDropdown
                                            label="Administrative Area Instance"
                                            options={[]}
                                            desc="Select the individual demarcation areas you want to analyze."
                                            disabled={false}
                                            onChange={() => {}}
                                            id=""
                                            isLoading={false}
                                        />
                                    </Stack>
                                </JoyBox>
                            </Grid>
                        </Grid>
                    </JoySheet>
                </JoyBox>
                <JoyBox sx={{ marginBottom: '50px' }}>
                    <JoyBox
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '40px',
                            marginBottom: '20px',
                        }}
                    >
                        <Typography
                            variant="h5"
                            style={{
                                fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
                                fontSize: 35,
                                fontWeight: "bold",
                                color: "#0b2f4e",
                            }}
                        >
                            Complete Communities Data
                        </Typography>
                    </JoyBox>
                    <JoyBox
                        sx={{ p: 2, borderRadius: 'sm', paddingBottom: '50px', backgroundColor: '#fff', boxShadow: 1 }}
                    >
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
