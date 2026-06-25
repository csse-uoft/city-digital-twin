import { useState, useEffect } from 'react'
import { Box, Table, TableHead, TableBody, TableRow, TableCell, Paper, TableContainer, Typography } from "@mui/material";
import { Input, Button, IconButton, Select, Autocomplete, Option } from '@mui/joy';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
const categories = [
  { id: 'health', label: 'Health', icon: '...', color: '#EF4444' },
  { id: 'retail', label: 'Retail & Services', icon: '...', color: '#FB923C' },
  { id: 'education', label: 'Education & childcare', icon:'...', color:'#3B82F6'},
  { id: 'cultural', label:'Cultural', icon:'...', color:'#92400E'},
  { id: 'communal', label:'Communal', icon:'...', color:'#EC4899'},
  { id: 'spiritual', label: 'Spiritual', icon:'...', color:'#A855F7'},
  { id: 'recreational', label:'Recreational', icon:'...', color:'#22C55E'}
]

const neighborhoods = [
  { id: 'city_avg',    label: 'City Average',              color: '#888' },
  { id: 'n70',        label: 'South Riverdale (70)',       color: '#A855F7' },
  { id: 'n77',        label: 'Waterfront Communities (77)', color: '#22C55E' },
  { id: 'n76',        label: 'Bay Street Corridor (76)',   color: '#F59E0B' },
]

const tableData = {
  health: {
    city_avg: { value: 25, delta: null },
    n70:      { value: 10, delta: -15 },
    n77:      { value: 75, delta: 50  },
    n76:      { value: 20, delta: -5  },
  },
  retail: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  },
  education: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  },
  cultural: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  },
  communal: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  },
  spiritual: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  },
  recreational: {
    city_avg: { value: 60, delta: null },
    n70:      { value: 77, delta: 17  },
    n77:      { value: 49, delta: -11},
    n76:      { value: 61, delta: 1}
  }
}

const rows = {
  city_avg: {
    health: 25,
    retail: 60,
    education: 60,
    cultural: 60,
    communal: 60,
    spiritual: 60,
    recreational: 60
  },
  n70: {
    health: 30,
    retail: 70,
    education: 60,
    cultural: 50,
    communal: 55,
    spiritual: 60,
    recreational: 78
  },
  n79: {
    health: 40,
    retail: 51,
    education: 60,
    cultural: 80,
    communal: 80,
    spiritual: 80,
    recreational: 60
  }
}

function getCellStyle (delta) {
    if (delta === null) return {}                          // city avg — no color
    if (delta > 0)  return { backgroundColor: '#f0fdf4' } // green tint
    if (delta < 0)  return { backgroundColor: '#fef2f2' } // red tint
    return { backgroundColor: '#f9fafb' }                  // neutral
}


function IconTableCell({ icon: Icon, iconSrc, iconSize = 16, label, align = 'left', ...props }) {
  return (
    <TableCell align={align} {...props}>
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
        <Typography sx={{fontWeight:'semibold', fontSize:12}}>{label}</Typography>
      </Box>
    </TableCell>
  );
}

function RowCell({walkability,cityAvg, ...props}) {
  const delta = walkability - cityAvg
  const background = getCellStyle(delta)
  return(
    <TableCell sx={{width:'150px'}} {...props}>
      <Box sx={{
        display: 'flex',
        alignItems:'center',
        flexDirection:'column',
        gap:1,
        p:1,
        justifyContent: 'center',
        backgroundColor: background?.backgroundColor ? background.backgroundColor : '#fff'
      }}>
        <Typography sx={{fontSize:12}}>{walkability}%</Typography>
        <Typography sx={{fontSize:10}}>{delta > 0 ? '+' : delta < 0 ? '-' : ''}{delta} vs city</Typography>
      </Box>
    </TableCell>
  )
}

const TabularBreakDownComponent = ({
    amenityData
}) => {
    const [cityAvg, setCityAvg] = useState({
      health: 25,
      retail: 60,
      education: 60,
      cultural: 60,
      communal:60,
      spiritual: 60,
      recreational:60
    })

    return(
        <Box sx={{width:'100%', maxWidth: {xs: '90dvw',md: 'calc(95dvw-450px)'},overflowX:'auto', height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'start',px:1,marginTop:'20px'}}>
            <TableContainer component={Paper} 
              sx={{
              overflowX:"auto", 
              backgroundColor:'white',
              boxShadow: 'none',
            }}>
              <Table>
                <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{fontWeight:"semibold"}}>Area</TableCell>
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="HEALTH" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="RETAIL & SERVICES" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="EDUCATION & CHILDCARE" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="CULTURAL" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="COMMUNAL" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="SPIRITUAL" />
                  <IconTableCell icon={HighlightOffIcon} iconSrc="" label="RECREATIONAL" />
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(rows).map(([key,value]) => {

                  return(
                    <TableRow>
                      <TableCell>
                        {key}
                      </TableCell>
                     <RowCell walkability={value.health} cityAvg={cityAvg.health} />
                     <RowCell walkability={value.retail} cityAvg={cityAvg.retail} />
                     <RowCell walkability={value.education} cityAvg={cityAvg.education} />
                     <RowCell walkability={value.cultural} cityAvg={cityAvg.cultural} />
                     <RowCell walkability={value.communal} cityAvg={cityAvg.communal} />
                     <RowCell walkability={value.spiritual} cityAvg={cityAvg.spiritual} />
                     <RowCell walkability={value.recreational} cityAvg={cityAvg.recreational} />
                    </TableRow>
                  )
                })}
              </TableBody>
              </Table>
            </TableContainer>
        </Box>
    )
}

export default TabularBreakDownComponent