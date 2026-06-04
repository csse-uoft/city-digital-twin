import React, { useState, useEffect } from 'react';
import { Box, Paper, Stack, Typography, Collapse } from '@mui/material';
import { Checkbox } from '@mui/joy';


const amenityCategories = {
        'Health':{ color: '#EF4444', types: ['Hospitals','Clinics','Pharmacies','Mental health services','Dental clinics','Physiotherapy/rehab','Fitness centres/gyms'] },
        'Retail & Services':{ color: '#FB923C', types: ['Mall','Restaurant'] },
        'Education & Childcare':{ color: '#3B82F6', types: ['School','Daycare'] },
        'Spiritual':{ color: '#A855F7', types: ['Church','Mosque','Sinnagog'] },
        'Cultural':{ color: '#92400E', types: ['Museum'] },
        'Communal':{ color: '#EC4899', types: ['Court House'] },
        'Recreational':{ color: '#22C55E', types: ['Arcade','Cinema/theatre'] }
    };

const FilterPanel = ({isOpen,updateFilters,filterState}) => {

    

    const [selectedAmenity, setSelectedAmenity] = useState('Health')
    // const [amenityCheckBoxes, setAmenityCheckBoxes] = useState([])

    const children = (
        <Stack spacing={0}>
            {
                amenityCategories[selectedAmenity]?.types?.map((type,index) => (
                    <Box sx={{width:'100%',py:1,px:1,boxSizing:'border-box'}}>
                    <Checkbox checked={filterState[type]?.show} onChange={(event) => {
                        const checked = event.target.checked
                        console.log('checked event: ',event)
                        // setAmenityCheckBoxes(prev => {
                        //     const checkList = [...prev]
                        //     checkList[index] = checked
                        //     return checkList
                        // })
                        updateFilters(selectedAmenity,type)
                    }} label={type} />
                    </Box>

                ))
            }
        </Stack>
    );

    const handleChange = (event) => {
        console.log('event: ',event)
        if (event.target.checked) {
            updateFilters(selectedAmenity,'all')
        } 
    }

    const selectAllChecked = (category) => {
        for (const key of Object.keys(filterState)) {
            if (filterState[key]?.type === category && filterState[key]?.show === false) {
                return false
            }
        }
        return true
    }

    // const selectAllIntermediate = () => {
    //     const checked = amenityCheckBoxes.filter(k => k === true)
    //     return checked.length > 0 && checked.length < amenityCheckBoxes.length
    // }

    useEffect(() => {
        if (!selectedAmenity) return
        // console.log('current amenity: ',selectedAmenity)
        // const checkList = amenityCategories[selectedAmenity]?.types?.map(() => (true))
        // console.log('set amenity checklist: ',checkList)
        // setAmenityCheckBoxes(checkList)
    },[selectedAmenity])

    if (!isOpen) {
        return null
    } else {
        return(
            <Paper
                sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                height: {xs: '100%', md: '400px'},
                width: {xs: '100%', md: '500px'},
                display:'flex'
            }}>
                <Box
                sx={{height:'100%',width:'200px', borderRight:'1px solid'}}>
                    <Box
                    sx={{borderBottom: '1px solid', py:1, px:1, height:'25px', display:'flex', alignItems:'center'}}>
                        <Typography
                        style={{fontSize:12, color:'#181818', textAlign:'left', fontWeight:'bold'}}
                        variant="h5">Amenity Types</Typography>
                    </Box>
                    <Stack spacing={0}>
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
                                backgroundColor: selectedAmenity === category ? 'white' : ''
                            }}
                            onClick={()=>setSelectedAmenity(category)}>
                                <Box sx={{borderRadius:'50%',backgroundColor: amenityCategories[category].color, width:'25px',height:'25px'}}>

                                </Box>
                                <Typography
                                variant="h5"
                                sx={{fontSize:12, color: selectedAmenity === category ? '#479ef5' : '#181818'}}>
                                    {category}
                                </Typography>

                            </Box>
                        ))}
                    </Stack>
                </Box>
                <Box
                sx={{width:'100%', height:'100%'}}>
                    <Box
                    sx={{py:1, px:1, height:'25px', display:'flex', alignItems:'center',borderBottom:'1px solid', justifyContent: 'space-between'}}>
                        <Typography
                        style={{fontSize:12, color:'#181818', textAlign:'left', fontWeight:'bold'}}
                        variant="h5">{selectedAmenity}</Typography>

                        <Checkbox
                            label="Select All"
                            checked={selectAllChecked(selectedAmenity)}
                            // indeterminate={selectAllIntermediate()}
                            onChange={handleChange}
                        />
                    </Box>
                    {children}
                </Box>

            </Paper>
        )
    }
}

export default FilterPanel