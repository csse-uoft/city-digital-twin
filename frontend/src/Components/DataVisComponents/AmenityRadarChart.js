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
const transformMultiAreaData = (walkabilityData, mode, categoryOptions) => {
  const areaNames = Object.keys(walkabilityData)

  if (mode === 'category') {
    // const categoryOptions = [
    //   ...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))
    // ]

    const rows = categoryOptions.map((category) => {
      const row = { name: category }
      areaNames.forEach((area) => {
        row[area] = walkabilityData[area]?.[category]?.walkability ?? null
      })
      return row
    })

    return { rows, areaNames }
  }

  // mode === 'subtype' — //we don't want it scope by category actually
  const subtypeNames = [
    ...new Set(
      areaNames.flatMap((area) => {
        const areaCategories = Object.keys(walkabilityData[area])
        return areaCategories.flatMap((category) => {
          return walkabilityData[area]?.[category].subtypes.map((k) => `${k.subtype} - ${category}`)
        })
      }

        // (walkabilityData[area]?.[subtypeCategory]?.subtypes ?? []).map((k) => k.subtype)
      )
    )
  ]
  console.log('subtypeNames: ',subtypeNames)

  const subtypeAreaCategoryMapping = areaNames.flatMap((area) => {
        const areaCategories = Object.keys(walkabilityData[area])
        return areaCategories.flatMap((category) => {
          return walkabilityData[area]?.[category].subtypes.map((k) => ({
            subtype: k.subtype,
            area: area,
            category: category,
            walkability: k.walkability
        }))
        })
      })
  console.log('bar chart multi area subtype mapping: ', subtypeAreaCategoryMapping)

  const rows = subtypeNames.map((subtypeName) => {
    const row = { name: subtypeName }
    areaNames.forEach((area) => {
      // const subtypes = walkabilityData[area]?.[subtypeCategory]?.subtypes ?? []
      // const match = subtypes.find((s) => s.subtype === subtypeName)
      const a = subtypeAreaCategoryMapping.filter((k) => k.area === area && `${k.subtype} - ${k.category}` === subtypeName)
      row[area] = a.at(0)?.walkability
    })
    return row
  })

  return { rows, areaNames }
}

// Single-area case
const transformSingleAreaData = (walkabilityData, mode, categoryOptions) => {
  const area = Object.keys(walkabilityData).at(0)
  const categoryMap = walkabilityData[area]
  if (mode === 'category') {
    return Object.keys(categoryMap).map((name) => ({
      name: name,
      walkability: categoryMap[name]?.walkability,
      color: getColor(categoryMap[name]?.color),
    }))
  }

  // return categoryOptions.flatMap((category) => {
  //   const subtypes = categoryMap[category]?.subtypes ?? []
  //   const categoryColor = getColor(categoryMap[category]?.color)
  //   return subtypes.map((subtype) => ({
  //     name: subtype.subtype,
  //     walkability: subtype.walkability,
  //     color: categoryColor,
  //     category: category
  //   }))
  // })
  let encounteredSubtypes = {}
  const l = categoryOptions.flatMap((category) => {
    const subtypes = categoryMap[category]?.subtypes ?? []
    const categoryColor = getColor(categoryMap[category]?.color)
    return subtypes.map((subtype) => {
      if (!Object.hasOwn(encounteredSubtypes,subtype.subtype)) {
        encounteredSubtypes[subtype.subtype] = true
        return {
        name: subtype.subtype,
        walkability: subtype.walkability,
        color: categoryColor,
        category: category
        }
      } else {
        return {
        name: `${subtype.subtype} - ${category}`,
        walkability: subtype.walkability,
        color: categoryColor,
        category: category
        }
      }
    })
  })
  console.log('bar chart subtype list: ',l)
  return l

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
      const { rows, areaNames } = transformMultiAreaData(walkabilityData, mode, categoryOptions)
      return { chartData: rows, areaNames }
    }
    return { chartData: transformSingleAreaData(walkabilityData, mode, categoryOptions), areaNames: [] }
  }, [walkabilityData, multiArea, mode, categoryOptions])

  const areaState = chartParameterState[chartParameterKey]

  const visibleChartData = useMemo(() => {
    //console.log('chart radar data: ',chartData)
    if (!areaState) return []
    if (mode === 'subtype' && !multiArea) {
      const visibleSubtypes = chartData.filter((entry) => {
        const entrySubtype = entry.name.split(' - ').at(0)
        return areaState.subtype?.[entry.category][entrySubtype]?.show
      })
      //console.log('visible subtyeps: ',visibleSubtypes)
      return visibleSubtypes
    } else if (mode === 'subtype' && multiArea) {
      console.log('subtype CHART DATA: ', chartData)
      const visibleSubtypes = chartData.filter((entry) => {
        const entrySubtype = entry.name.split(' - ').at(0)
        const entryCategory = entry.name.split(' - ').at(-1)
        return areaState.subtype?.[entryCategory][entrySubtype]?.show
      })
      //console.log('visible subtyeps: ',visibleSubtypes)
      return visibleSubtypes
    }
    const categoryState = areaState.category ?? {}
    const visibleCategories = chartData.filter((entry) => categoryState[entry.name]?.show)
    //console.log('visible categories: ',visibleCategories)
    return visibleCategories
  }, [chartData, areaState, mode, categoryOptions, chartParameterState])

  return (
    <>
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
                isAnimationActive={true}
              />
            ))
          ) : (
            <Radar
              name={'Walkability'}
              dataKey="walkability"
              stroke={AREA_COLOR_PALETTE[0]}
              fill={AREA_COLOR_PALETTE[0]}
              fillOpacity={0.6}
              isAnimationActive={true}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </>
  )
}

export default AmenityRadarChart
