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
import { useMemo, useState, useEffect } from 'react'
import { Select, Option } from '@mui/joy'

const AREA_COLOR_PALETTE = ['#3B82F6', '#EC4899', '#22C55E', '#FB923C', '#A855F7', '#EF4444', '#92400E']

const isMultiArea = (walkabilityData) => {
  if (!walkabilityData || typeof walkabilityData !== 'object') return false
  const areas = Object.keys(walkabilityData)
  return areas.length > 1
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
const transformSingleAreaData = (walkabilityData, mode, subtypeCategory) => {
  const area = Object.keys(walkabilityData).at(0)
  const categoryMap = walkabilityData[area]
  if (mode === 'category') {
    return Object.keys(categoryMap).map((name) => ({
      name: name,
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
    color: categoryColor,
  }))
}

const AmenityRadarChart = ({ walkabilityData, chartParameterState, chartParameterKey, mode }) => {
  const multiArea = useMemo(() => isMultiArea(walkabilityData), [walkabilityData])
  const [subtypeCategory, setSubtypeCategory] = useState('Health')

  const categoryOptions = useMemo(() => {
    if (!walkabilityData) return []
    const areaNames = Object.keys(walkabilityData)
    return [...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))]
  }, [walkabilityData])

  // keep subtypeCategory pointing at a real category once data/options load
  useEffect(() => {
    if (categoryOptions.length > 0 && !categoryOptions.includes(subtypeCategory)) {
      setSubtypeCategory(categoryOptions[0])
    }
  }, [categoryOptions])

  const { chartData, areaNames } = useMemo(() => {
    if (!walkabilityData || Object.keys(walkabilityData).length === 0) {
      return { chartData: [], areaNames: [] }
    }
    if (multiArea) {
      const { rows, areaNames } = transformMultiAreaData(walkabilityData, mode, subtypeCategory)
      return { chartData: rows, areaNames }
    }
    return { chartData: transformSingleAreaData(walkabilityData, mode, subtypeCategory), areaNames: [] }
  }, [walkabilityData, multiArea, mode, subtypeCategory])

  const areaState = chartParameterState[chartParameterKey]

  const visibleChartData = useMemo(() => {
    //console.log('chart radar data: ',chartData)
    if (!areaState) return []
    if (mode === 'subtype') {
      const subtypeState = areaState.subtype?.[subtypeCategory] ?? {}
      const visibleSubtypes = chartData.filter((entry) => subtypeState[entry.name]?.show)
      //console.log('visible subtyeps: ',visibleSubtypes)
      return visibleSubtypes
    }
    const categoryState = areaState.category ?? {}
    const visibleCategories = chartData.filter((entry) => categoryState[entry.name]?.show)
    //console.log('visible categories: ',visibleCategories)
    return visibleCategories
  }, [chartData, areaState, mode, subtypeCategory, chartParameterState])

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
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={visibleChartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fontSize: 2 }} />
          <Tooltip />
          <Legend />

          {multiArea ? (
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
            <Radar
              name={mode === 'subtype' ? subtypeCategory : 'Walkability'}
              dataKey="walkability"
              stroke={AREA_COLOR_PALETTE[0]}
              fill={AREA_COLOR_PALETTE[0]}
              fillOpacity={0.6}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </>
  )
}

export default AmenityRadarChart
