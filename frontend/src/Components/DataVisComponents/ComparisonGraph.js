import { Stack, Typography } from "@mui/joy";
import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

export default function ComparisonGraph({data, colors}) {
    console.log("data in graph component", data)
    // Extracting years
    const years = [...new Set(Object.values(data)
        .flatMap(indicatorData => Object.values(indicatorData.data)
        .flatMap(neighborhoodData => Object.keys(neighborhoodData))))];

    // Aggregate data
    const aggregatedData = years.map(year => {
        const entry = { name: year };
        Object.keys(data).forEach(indicator => {
            const indicatorData = data[indicator].data;
            const total = Object.values(indicatorData)
                .flatMap(neighborhoodData => neighborhoodData[year] || 0)
                .reduce((sum, value) => sum + (value || 0), 0);
            entry[`${indicator.split('#')[1] || 'unknown'}`] = total;
        });
        return entry;
    });

    console.log("aggregaed data", aggregatedData);
  
    return (
        <Stack>
            <Typography
                  variant="h4"
                  align="center"
                  style={{
                    fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
                    fontSize: 35,
                    fontWeight: "bold",
                    paddingBottom: '40px'
                  }}
                  sx={{}}
                >
                  {"Comparison of the Indicators"}
            </Typography>
            <BarChart width={730} height={450} data={aggregatedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(data).map((indicatorKey, index) => (
                    <Bar
                        key={index}
                        dataKey={`${indicatorKey.split('#')[1] || 'unknown'}`}
                        fill={colors[index % colors.length]}
                    />
                ))}
            </BarChart>


        </Stack>

    );
  }