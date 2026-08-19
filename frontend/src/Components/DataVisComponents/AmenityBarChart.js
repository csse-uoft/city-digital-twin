import { BarChart, Legend, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Cell, ResponsiveContainer } from 'recharts';
import { Select, Option } from '@mui/joy'
// import { RechartsDevtools } from '@recharts/devtools';
import { useState, useEffect, useMemo } from 'react'
const AREA_COLOR_PALETTE = ['#3B82F6', '#EC4899', '#22C55E', '#FB923C', '#A855F7', '#EF4444', '#92400E']

const isMultiArea = (walkabilityData) => {
  if (!walkabilityData || typeof walkabilityData !== 'object') return false
  const areas = Object.keys(walkabilityData)
  return areas.length > 1
  // const firstValue = Object.values(walkabilityData)[0]
  // return !!firstValue && typeof firstValue === 'object' && !('walkability' in firstValue)
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

const AmenityBarChart = ({ 
  walkabilityData, 
  chartParameterState, 
  chartParameterKey, 
  mode 
}) => {
  const multiArea = useMemo(() => isMultiArea(walkabilityData), [walkabilityData])
  const [subtypeCategory, setSubtypeCategory] = useState('Health')
  const categoryOptions = useMemo(() => {
    if (!walkabilityData) return []
    const areaNames = Object.keys(walkabilityData)
    return [...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))]
  }, [walkabilityData])

  const { chartData, areaNames } = useMemo(() => {
    //console.log('walkability data received in bar chart: ',walkabilityData)
    if (!walkabilityData || Object.keys(walkabilityData).length === 0) {
      return { chartData: [], areaNames: [] }
    }
    if (multiArea) {
      const { rows, areaNames } = transformMultiAreaData(walkabilityData,mode,categoryOptions)
      return { chartData: rows, areaNames }
    }
    return { chartData: transformSingleAreaData(walkabilityData,mode,categoryOptions), areaNames: [] }
  }, [walkabilityData, multiArea, mode, categoryOptions])
  

  console.dir(chartParameterState, {depth:null})
  const areaState = chartParameterState[chartParameterKey]

  const visibleChartData = useMemo(() => {
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
      <BarChart data={visibleChartData}>
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
            {visibleChartData.map((entry, index) => (
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
