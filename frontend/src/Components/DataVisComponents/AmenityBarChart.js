import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Cell, ResponsiveContainer } from 'recharts';
// import { RechartsDevtools } from '@recharts/devtools';
import { useState, useEffect, useMemo } from 'react'
const AREA_COLOR_PALETTE = ['#3B82F6', '#EC4899', '#22C55E', '#FB923C', '#A855F7', '#EF4444', '#92400E']

const isMultiArea = (walkabilityData) => {
  if (!walkabilityData || typeof walkabilityData !== 'object') return false
  const firstValue = Object.values(walkabilityData)[0]
  return !!firstValue && typeof firstValue === 'object' && !('walkability' in firstValue)
}

const getColor = (rawColor, fallback = '#ccc') => (rawColor ? `#${rawColor}` : fallback)

// Multi-area case: one row per category, one field per area for grouped bars
const transformMultiAreaData = (walkabilityData) => {
  const areaNames = Object.keys(walkabilityData)

  // Union of all category names across all areas, in case areas differ
  const categoryNames = [
    ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
  ]

  const rows = categoryNames.map((category) => {
    const row = { name: category }
    areaNames.forEach((area) => {
      row[area] = walkabilityData[area]?.[category]?.walkability ?? null
    })
    return row
  })

  return { rows, areaNames }
}

const transformSingleAreaData = (categoryMap) => {
  return Object.keys(categoryMap).map((name) => ({
    name,
    walkability: categoryMap[name]?.walkability,
    color: getColor(categoryMap[name]?.color),
  }))
}

const isVisible = (mode,parameter,state) => {
  if (mode === 'category') {
    
  } else {

  }
}

// const transformCategoryData = (amenityData) => {

//   return Object.keys(amenityData).map((name) => {
//     return {walkability: amenityData[name]?.walkability, name: name, color: `#${amenityData[name]?.color}` ?? '#ccc'}        // add name field
//   })

// };

// const transformSubtypeData = (amenityData) => {

// }

const AmenityBarChart = ({ walkabilityData, chartParameterState, key, mode }) => {
  const multiArea = useMemo(() => isMultiArea(walkabilityData), [walkabilityData])
  const [subtypeCategory, setSubtypeCategory] = useState('Health')
  const { chartData, areaNames } = useMemo(() => {
    console.log('walkability data received in bar chart: ',walkabilityData)
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
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width={60} domain={[0, 1]} />
        <Tooltip />
        <Legend />

        {multiArea ? (
          // One <Bar> series per area, grouped side-by-side per category
          areaNames.map((area, index) => (
            <Bar
              key={area}
              dataKey={area}
              name={area}
              fill={AREA_COLOR_PALETTE[index % AREA_COLOR_PALETTE.length]}
              radius={[10, 10, 0, 0]}
            />
          ))
        ) : (
          // Single series, colored per-category
          <Bar dataKey="walkability" radius={[10, 10, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default AmenityBarChart