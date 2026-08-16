import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Cell, ResponsiveContainer } from 'recharts';
import { Select, Option } from '@mui/joy'
// import { RechartsDevtools } from '@recharts/devtools';
import { useState, useEffect, useMemo } from 'react'
const AREA_COLOR_PALETTE = ['#3B82F6', '#EC4899', '#22C55E', '#FB923C', '#A855F7', '#EF4444', '#92400E']

const isMultiArea = (walkabilityData) => {
  if (!walkabilityData || typeof walkabilityData !== 'object') return false
  const firstValue = Object.values(walkabilityData)[0]
  return !!firstValue && typeof firstValue === 'object' && !('walkability' in firstValue)
}

const getColor = (rawColor, fallback = '#ccc') => (rawColor ? `#${rawColor}` : fallback)

// Multi-area case
// mode === 'category': one row per category, one field per area
// mode === 'subtype': one row per subtype (within subtypeCategory only), one field per area
const transformMultiAreaData = (walkabilityData, mode, subtypeCategory) => {
  const areaNames = Object.keys(walkabilityData)

  if (mode === 'category') {
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

  // mode === 'subtype' — scoped to a single category, so no name collisions
  const subtypeNames = [
    ...new Set(
      areaNames.flatMap((area) =>
        (walkabilityData[area]?.[subtypeCategory]?.subtypes ?? []).map((k) => k.subtype)
      )
    )
  ]

  const rows = subtypeNames.map((subtypeName) => {
    const row = { name: subtypeName }
    areaNames.forEach((area) => {
      const subtypes = walkabilityData[area]?.[subtypeCategory]?.subtypes ?? []
      const match = subtypes.find((s) => s.subtype === subtypeName)
      row[area] = match?.walkability ?? null
    })
    return row
  })

  return { rows, areaNames }
}

// Single-area case
const transformSingleAreaData = (categoryMap, mode, subtypeCategory) => {
  if (mode === 'category') {
    return Object.keys(categoryMap).map((name) => ({
      name,
      walkability: categoryMap[name]?.walkability,
      color: getColor(categoryMap[name]?.color),
    }))
  }

  // mode === 'subtype' — scoped to a single category
  const subtypes = categoryMap[subtypeCategory]?.subtypes ?? []
  const categoryColor = getColor(categoryMap[subtypeCategory]?.color)

  return subtypes.map((subtype) => ({
    name: subtype.subtype,
    walkability: subtype.walkability,
    color: categoryColor, // all subtypes inherit their parent category's color
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

const AmenityBarChart = ({ walkabilityData, chartParameterState, chartParameterkey, mode }) => {
  const multiArea = useMemo(() => isMultiArea(walkabilityData), [walkabilityData])
  const [subtypeCategory, setSubtypeCategory] = useState('Health')
  const categoryOptions = useMemo(() => {
    if (!walkabilityData) return []
    const areaNames = Object.keys(walkabilityData)
    return [...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))]
  }, [walkabilityData])
  const { chartData, areaNames } = useMemo(() => {
    console.log('walkability data received in bar chart: ',walkabilityData)
    if (!walkabilityData || Object.keys(walkabilityData).length === 0) {
      return { chartData: [], areaNames: [] }
    }
    if (multiArea) {
      const { rows, areaNames } = transformMultiAreaData(walkabilityData,mode,subtypeCategory)
      return { chartData: rows, areaNames }
    }
    return { chartData: transformSingleAreaData(walkabilityData,mode,subtypeCategory), areaNames: [] }
  }, [walkabilityData, multiArea, mode,subtypeCategory])


  return (
    <>
    {mode === 'subtype' && (
        <Select value={subtypeCategory} onChange={(_, val) => setSubtypeCategory(val)}>
          {categoryOptions.map((cat) => (
            <Option key={cat} value={cat}>{cat}</Option>
          ))}
        </Select>
      )}
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
    </>
  )
}

export default AmenityBarChart