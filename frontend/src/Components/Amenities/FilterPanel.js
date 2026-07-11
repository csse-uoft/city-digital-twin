import React, { useState, useEffect } from 'react';
import { Box, Paper, Stack, Typography, Collapse } from '@mui/material';
import { Checkbox } from '@mui/joy';


// const amenityCategories = {
//         'Health':{ color: '#EF4444', types: ['Hospitals','Clinics','Pharmacies','Mental health services','Dental clinics','Physiotherapy/rehab','Fitness centres/gyms'] },
//         'Retail & Services':{ color: '#FB923C', types: ['Mall','Restaurant'] },
//         'Education & Childcare':{ color: '#3B82F6', types: ['School','Daycare'] },
//         'Spiritual':{ color: '#A855F7', types: ['Church','Mosque','Sinnagog'] },
//         'Cultural':{ color: '#92400E', types: ['Museum'] },
//         'Communal':{ color: '#EC4899', types: ['Court House'] },
//         'Recreational':{ color: '#22C55E', types: ['Arcade','Cinema/theatre'] }
//     };

const FilterPanel = ({isOpen,updateFilters,filterState,amenityCategories}) => {
    const [selectedAmenity, setSelectedAmenity] = useState('Health')
    if (!isOpen || !filterState) {
        return null
    }

    console.log('FILTERPANEL.JS filter state: ',filterState)
    // const [amenityCheckBoxes, setAmenityCheckBoxes] = useState([])

    const children = (
        <Stack spacing={0}>
            {
                amenityCategories[selectedAmenity]?.subtypes?.map((type,index) => (
                    <Box sx={{width:'100%',py:1,px:1,boxSizing:'border-box'}}>
                    <Checkbox checked={filterState[selectedAmenity][type]?.show} onChange={(event) => {
                        const checked = event.target.checked
                        console.log('checked event: ',event)
                        // setAmenityCheckBoxes(prev => {
                        //     const checkList = [...prev]
                        //     checkList[index] = checked
                        //     return checkList
                        // })
                        updateFilters(selectedAmenity,type)
                    }} label={type}
                    slotProps={{
                        label: { style: { fontSize: '12px' } }
                    }} />
                    </Box>

                ))
            }
        </Stack>
    );

    const handleChange = (event) => {
        // console.log('select all event: ',event)
        if (event.target.checked) {
            updateFilters(selectedAmenity,'all')
        } 
    }

    const selectAllChecked = (category) => {
        for (const key of Object.keys(filterState[category])) {
            if (key != 'showAll' && filterState[category][key]?.show === false) {
                return false
            }
        }
        return true
    }

    return(
        <Paper
            sx={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            height: {xs: '100%', md: '400px'},
            width: {xs: '100%', md: '500px'},
            display:'flex',
            border: '1px solid var(--border-color)',
            backgroundColor:'white'
        }}>
            <Box
            sx={{height:'100%',width: {xs:'270px', md:'400px'}, borderRight:'1px solid var(--border-color)', backgroundColor: '#f9fafb'}}>
                <Box
                sx={{borderBottom: '1px solid var(--border-color)', py:1, px:1, height:'25px', display:'flex', alignItems:'center'}}>
                    <Typography
                    style={{fontSize:14, color:'#181818', textAlign:'left', fontWeight:'medium'}}
                    variant="h5">Amenity Types</Typography>
                </Box>
                <Stack spacing={1}>
                    {Object.keys(amenityCategories)?.map((category) => (
                        <Box
                        sx={{
                            width:'100%', 
                            alignItems:'center', 
                            justifyContent:'flex-start', 
                            gap:1, 
                            display:'flex', 
                            boxSizing:'border-box', 
                            px:1, 
                            py:1, 
                            cursor:'pointer',
                            backgroundColor: selectedAmenity === category ? 'white' : '',
                            borderLeft: selectedAmenity === category ? `2px solid #${amenityCategories[category].colour}` : ''
                        }}
                        onClick={()=>setSelectedAmenity(category)}>
                            <Box sx={{borderRadius:'50%',backgroundColor: `#${amenityCategories[category].colour}`, width:'16px',height:'16px'}}>

                            </Box>
                            <Typography
                            variant="h5"
                            sx={{fontSize:12, color: selectedAmenity === category ? '#479ef5' : '#181818'}}>
                                {amenityCategories[category].label}
                            </Typography>

                        </Box>
                    ))}
                </Stack>
            </Box>
            <Box
            sx={{width:'100%', height:'100%'}}>
                <Box
                sx={{py:1, px:1, height:'25px', display:'flex', alignItems:'center',borderBottom:'1px solid var(--border-color)', justifyContent: 'space-between'}}>
                    <Typography
                    sx={{fontSize: {xs: '12px', md:'14px'}, color:'#181818', textAlign:'left', fontWeight:'medium'}}
                    variant="h5">{amenityCategories[selectedAmenity].label}</Typography>

                    <Checkbox
                        label="Select All"
                        checked={selectAllChecked(selectedAmenity)}
                        // indeterminate={selectAllIntermediate()}
                        onChange={handleChange}
                        slotProps={{
                            label: { style: { fontSize:'12px' } }
                        }}
                    />
                </Box>
                {children}
            </Box>

        </Paper>
    )
    
}

export default FilterPanel