// import {
//   RadarChart,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   Radar,
//   Legend,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// const transformDataForRadar = (walkabilityData) => {
//   const amenityTypes = new Set(); //a list of all the types of amenities (health, education, spritual, etc)

//   // Get all possible amenity types across neighborhoods
//   Object.values(walkabilityData).forEach((amenities) => { //array of values for all fields. Each value is it's own object that categorizes the amenities for a neighborhood by types
//     Object.keys(amenities).forEach((type) => amenityTypes.add(type));
//   });

//   // Transform to a list of { amenityType, Neighborhood1: val, Neighborhood2: val, ... }
//   const radarData = [...amenityTypes].map((type) => {
//     const entry = { amenity: type };
//     Object.entries(walkabilityData).forEach(([neighborhood, amenities]) => {
//       entry[neighborhood] = parseFloat(amenities[type]) || 0; // this number is a walkability score
//     });
//     return entry;
//   });

//   return radarData;
// };

// const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

// const AmenityRadarChart = ({ walkabilityData }) => {
//   const data = transformDataForRadar(walkabilityData);
//   const neighborhoodNames = Object.keys(walkabilityData);

//   return (
//     <ResponsiveContainer width="90%" height={500}>
//       <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
//         <PolarGrid />
//         <PolarAngleAxis dataKey="amenity" />
//         <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{fontSize:2}}/>
//         <Tooltip />
//         <Legend />
//         {neighborhoodNames.map((name, i) => (
//           <Radar
//             key={name}
//             name={name}
//             dataKey={name}
//             stroke={colors[i % colors.length]}
//             fill={colors[i % colors.length]}
//             fillOpacity={0.6}
//           />
//         ))}
//       </RadarChart>
//     </ResponsiveContainer>
//   );
// };

// export default AmenityRadarChart;

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'

const AREA_COLOR_PALETTE = ['#3B82F6', '#EC4899', '#22C55E', '#FB923C', '#A855F7', '#EF4444', '#92400E']

const isMultiArea = (walkabilityData) => {
  if (!walkabilityData || typeof walkabilityData !== 'object') return false
  const firstValue = Object.values(walkabilityData)[0]
  return !!firstValue && typeof firstValue === 'object' && !('walkability' in firstValue)
}

// Multi-area case: one row per category (amenity type), one field per area
const transformMultiAreaData = (walkabilityData) => {
  const areaNames = Object.keys(walkabilityData)

  // Union of all category names across all areas, in case areas differ
  const categoryNames = [
    ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
  ]

  const rows = categoryNames.map((category) => {
    const row = { amenity: category }
    areaNames.forEach((area) => {
      row[area] = parseFloat(walkabilityData[area]?.[category]?.walkability) || 0
    })
    return row
  })

  return { rows, areaNames }
}

// Single-area case: one row per category, single "walkability" field
const transformSingleAreaData = (categoryMap) => {
  return Object.keys(categoryMap).map((amenity) => ({
    amenity,
    walkability: parseFloat(categoryMap[amenity]?.walkability) || 0,
  }))
}

const AmenityRadarChart = ({ walkabilityData }) => {
  const multiArea = useMemo(() => isMultiArea(walkabilityData), [walkabilityData])

  const { chartData, areaNames } = useMemo(() => {
    if (!walkabilityData || Object.keys(walkabilityData).length === 0) {
      return { chartData: [], areaNames: [] }
    }
    if (multiArea) {
      const { rows, areaNames } = transformMultiAreaData(walkabilityData)
      return { chartData: rows, areaNames }
    }
    return { chartData: transformSingleAreaData(walkabilityData), areaNames: [] }
  }, [walkabilityData, multiArea])

  return (
    <ResponsiveContainer width="90%" height={500}>
      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="amenity" />
        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fontSize: 2 }} />
        <Tooltip />
        <Legend />

        {multiArea ? (
          // One <Radar> series per area
          areaNames.map((area, index) => (
            <Radar
              key={area}
              name={area}
              dataKey={area}
              stroke={AREA_COLOR_PALETTE[index % AREA_COLOR_PALETTE.length]}
              fill={AREA_COLOR_PALETTE[index % AREA_COLOR_PALETTE.length]}
              fillOpacity={0.6}
            />
          ))
        ) : (
          // Single series
          <Radar
            name="Walkability"
            dataKey="walkability"
            stroke={AREA_COLOR_PALETTE[0]}
            fill={AREA_COLOR_PALETTE[0]}
            fillOpacity={0.6}
          />
        )}
      </RadarChart>
    </ResponsiveContainer>
  )
}

export default AmenityRadarChart
