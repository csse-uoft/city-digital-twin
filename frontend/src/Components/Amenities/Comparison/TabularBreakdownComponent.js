import { useState, useEffect, useMemo } from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option, CircularProgress } from '@mui/joy';
import { fetchWalkabilityData } from '../../../helpers/fetchFunctions'
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
// const categories = [
//   { id: 'health', label: 'Health', icon: '...', color: '#EF4444' },
//   { id: 'retail', label: 'Retail & Services', icon: '...', color: '#FB923C' },
//   { id: 'education', label: 'Education & childcare', icon:'...', color:'#3B82F6'},
//   { id: 'cultural', label:'Cultural', icon:'...', color:'#92400E'},
//   { id: 'communal', label:'Communal', icon:'...', color:'#EC4899'},
//   { id: 'spiritual', label: 'Spiritual', icon:'...', color:'#A855F7'},
//   { id: 'recreational', label:'Recreational', icon:'...', color:'#22C55E'}
// ]

// const neighborhoods = [
//   { id: 'city_avg',    label: 'City Average',              color: '#888' },
//   { id: 'n70',        label: 'South Riverdale (70)',       color: '#A855F7' },
//   { id: 'n77',        label: 'Waterfront Communities (77)', color: '#22C55E' },
//   { id: 'n76',        label: 'Bay Street Corridor (76)',   color: '#F59E0B' },
// ]

// const tableData = {
//   health: {
//     city_avg: { value: 25, delta: null },
//     n70:      { value: 10, delta: -15 },
//     n77:      { value: 75, delta: 50  },
//     n76:      { value: 20, delta: -5  },
//   },
//   retail: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   },
//   education: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   },
//   cultural: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   },
//   communal: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   },
//   spiritual: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   },
//   recreational: {
//     city_avg: { value: 60, delta: null },
//     n70:      { value: 77, delta: 17  },
//     n77:      { value: 49, delta: -11},
//     n76:      { value: 61, delta: 1}
//   }
// }

// const rows = {
//   city_avg: {
//     health: 25,
//     retail: 60,
//     education: 60,
//     cultural: 60,
//     communal: 60,
//     spiritual: 60,
//     recreational: 60
//   },
//   n70: {
//     health: 30,
//     retail: 70,
//     education: 60,
//     cultural: 50,
//     communal: 55,
//     spiritual: 60,
//     recreational: 78
//   },
//   n79: {
//     health: 40,
//     retail: 51,
//     education: 60,
//     cultural: 80,
//     communal: 80,
//     spiritual: 80,
//     recreational: 60
//   }
// }

function transformRows (walkabilityData,categoryOptions) {
  // console.log('rows walkabilityData: ',walkabilityData)
  let rows = {}
  const areaNames = Object.keys(walkabilityData)
  // const categoryOptions = [...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))]
  areaNames.forEach((area) => {
    rows[area] = {}
    categoryOptions.forEach((category) => {
      rows[area][category] = walkabilityData[area]?.[category]?.walkability ?? null
    })
  })
  // console.log('tabular rows: ',rows)
  return rows
}

function getCellStyle (delta) {
    if (delta === null) return {}                          // city avg — no color
    if (delta > 0)  return { backgroundColor: '#cdf6d9' } // green tint
    if (delta < 0)  return { backgroundColor: '#ffd8d8' } // red tint
    return { backgroundColor: '#f9fafb' }                  // neutral
}


const COLUMN_WIDTH = 150;

function IconTableCell({ icon: Icon, iconSrc, iconSize = 22, label, align = 'left', ...props }) {
  return (
    <TableCell
      align={align}
      sx={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH, ...props.sx }}
      {...props}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 0.8
      }}>
        {iconSrc ? (
          <img
            src={iconSrc}
            alt=""
            width={iconSize}
            height={iconSize}
            style={{ objectFit: 'contain' }}
          />
        ) : Icon ? (
          <Icon fontSize="small" sx={{ color: 'var(--text-medium)' }} />
        ) : null}
        <Typography sx={{fontWeight:'semibold', fontSize:13}}>{label}</Typography>
      </Box>
    </TableCell>
  );
}

function RowCell({walkability,cityAvg, ...props}) {
  const delta = ((walkability - cityAvg)*100).toFixed(0) ?? null
  const background = getCellStyle(delta)
  return(
    <TableCell sx={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }} {...props}>
      <Box sx={{
        display: 'flex',
        alignItems:'center',
        flexDirection:'column',
        gap:1,
        p:1,
        borderRadius:'4px',
        justifyContent: 'center',
        backgroundColor: background?.backgroundColor ? background.backgroundColor : '#fff'
      }}>
        <Typography sx={{fontSize: {md: 14, xs:12}}}>{(walkability*100).toFixed(0) ?? null}%</Typography>
        <Typography sx={{fontSize: {md:12, xs:10}}}>{delta != null && delta > 0 ? '+' : ''}{delta} vs city</Typography>
      </Box>
    </TableCell>
  )
}

const TabularBreakDownComponent = ({
    cityURI,
    amenityCategories,
    areaURIList
}) => {
    const [cityAvg, setCityAvg] = useState(() => {
      return JSON.parse(sessionStorage.getItem(cityURI)) ?? 
      {
      Health: null,
      RetailAndServices: null,
      EducationAndChildcare: null,
      Cultural: null,
      Communal:null,
      Spiritual: null,
      Recreational:null,
      ParkService: null,
      PublicTransitService: null
    }})
    const [loading, setLoading] = useState(false)
    const [walkabilityData, setWalkabilityData] = useState({})

    useEffect(() => {
      const getData = async () => {
        setLoading(true)
        try {
          let obj = {}
          const dataResult = await Promise.all(Object.keys(areaURIList).map(async (uri) => ({areaName: areaURIList[uri], data: await fetchWalkabilityData(uri,cityURI)})))
          dataResult.forEach((item) => {
              obj[item.areaName] = item.data
          })
          setWalkabilityData(obj)
        } catch (err) {
          console.error('Failed to get walkability data for tabular compare component')
        } finally {
          setLoading(false)
        }

      }

      getData()
    }, [areaURIList])

    const categoryOptions = useMemo(() => {
      if (!walkabilityData) return []
      const areaNames = Object.keys(walkabilityData)
      return [...new Set(areaNames.flatMap((area) => Object.keys(walkabilityData[area])))]
    }, [walkabilityData])

    const rows = useMemo(() => {
      if (!walkabilityData) return {}
      return transformRows(walkabilityData,categoryOptions)
    }, [walkabilityData,categoryOptions]) 

    return(
        <Box sx={{width:'100%', maxWidth: {xs: '90dvw',md: 'calc(95dvw - 450px)'},overflowX:'auto', boxSixing:'border-box', height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'start',px:1, margin:'auto'}}>
            {loading ? (<Box sx={{height:'100%',width:'100%',display:'flex',alginItems:'center', justifyContent:'center'}}>
                <CircularProgress />
              </Box>
              
            ) :
            <TableContainer component={Paper} 
              sx={{
              overflowX:"auto", 
              backgroundColor:'white',
              boxShadow: 'none',
              marginBottom:'28px'
            }}>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{fontWeight:"bold", width: 100, minWidth: 100}}>Area</TableCell>
                  {categoryOptions?.map((category) => (
                    <IconTableCell key={category} icon={HighlightOffIcon} iconSrc={amenityCategories[category]?.icon ?? ''} label={category}  />
                  ))}
                  
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(rows)?.map(([key,value]) => {

                  return(
                    <TableRow key={key}>
                      <TableCell sx={{ width: COLUMN_WIDTH, minWidth: COLUMN_WIDTH }}>
                        {key}
                      </TableCell>
                      {categoryOptions.map((category) => (
                        <RowCell key={`${key}-${category}`} walkability={value[category]} cityAvg={cityAvg[category]} />
                      ))}
                     {/* <RowCell walkability={value.health} cityAvg={cityAvg.health} />
                     <RowCell walkability={value.retail} cityAvg={cityAvg.retail} />
                     <RowCell walkability={value.education} cityAvg={cityAvg.education} />
                     <RowCell walkability={value.cultural} cityAvg={cityAvg.cultural} />
                     <RowCell walkability={value.communal} cityAvg={cityAvg.communal} />
                     <RowCell walkability={value.spiritual} cityAvg={cityAvg.spiritual} />
                     <RowCell walkability={value.recreational} cityAvg={cityAvg.recreational} /> */}
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
            </TableContainer>}
        </Box>
    )
}

export default TabularBreakDownComponent