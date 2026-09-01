import React, { useMemo } from 'react';
import { Box, Checkbox, FormControlLabel, Stack, Typography, Button } from '@mui/material';


const LABEL_MAP = {
  Health: 'Health',
  RetailAndServices: 'Retail & Services',
  EducationAndChildcare: 'Education & Childcare',
  Cultural: 'Cultural',
  Communal: 'Communal',
  Spiritual: 'Spiritual',
  Recreational: 'Recreational',
  ParkService: 'Park Service',
  PublicTransitService: 'Public Transit',
};

const defaultState = {
  Communal: { show: true, icon: '' },
  Cultural: { show: true, icon: '' },
  EducationAndChildcare: { show: true, icon: '' },
  Health: { show: true, icon: '' },
  ParkService: { show: true, icon: '' },
  PublicTransitService: { show: true, icon: '' },
  RetailAndServices: { show: true, icon: '' },
};

const checkboxStyles = {
  color: '#1f7ae0',
  '&.Mui-checked': {
    color: '#1f7ae0',
  },
  '& .MuiSvgIcon-root': {
    width: 18,
    height: 18,
    borderRadius: 2,
  },
};

function formatSubtypes (subtypeState) {
    //console.log('subtype state: ', subtypeState)
    // console.log('aa: ',Object.values(subtypeState).reduce((acc, subtypes) => ({ ...acc, ...subtypes }), {}))
    return Object.values(subtypeState).reduce((acc, subtypes) => ({ ...acc, ...subtypes }), {})
}

const ChartSubtypeFilter = ({
  subtypeFilterState,
  onChange = () => {},
  title = 'Parameters',
}) => {
  const normalizedState = useMemo(() => {
    return subtypeFilterState
  }, [subtypeFilterState]);
  const categories = Object.keys(normalizedState);

  const isVisible = (key,category) => {
    return normalizedState[category][key]?.show ?? false
  };

  const handleToggle = (key,category) => {
    const current = normalizedState[category][key];
    const nextValue = {
      ...(current && typeof current === 'object' ? current : { show: Boolean(current), icon: '' }),
      show: !isVisible(key,category),
    };

    const nextState = {...normalizedState}
    nextState[category][key] = nextValue
    onChange(nextState);
  };

  const handleDeselectAll = () => {
    const nextState = {};
    Object.keys(normalizedState).forEach((category) => {
      nextState[category] = {};
      Object.keys(normalizedState[category]).forEach((key) => {
        nextState[category][key] = {
          ...normalizedState[category][key],
          show: false,
        };
      });
    });
    onChange(nextState);
  };

  const handleSelectAll = () => {
    const nextState = {};
    Object.keys(normalizedState).forEach((category) => {
      nextState[category] = {};
      Object.keys(normalizedState[category]).forEach((key) => {
        nextState[category][key] = {
          ...normalizedState[category][key],
          show: true,
        };
      });
    });
    onChange(nextState);
  };

  const handleSelect = (selectedCount) => {
    if (selectedCount === 0) {
      handleSelectAll()
    } else {
      handleDeselectAll()
    }
  }

  const selectedCount = useMemo(() => {
    const formattedSubtypes = formatSubtypes(subtypeFilterState)
    return Object.keys(formattedSubtypes).filter(k => formattedSubtypes[k].show).length
  }, [subtypeFilterState])

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 280,
        backgroundColor: '#fff',
        borderRadius: 2,
        p: 1,
        boxSizing: 'border-box',
        overflowY:'auto',
        maxHeight:380
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
          px: 0.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: '#2f2f2f',
          }}
        >
          {title}
        </Typography>

        <Button
          variant="text"
          size="small"
          onClick={() => handleSelect(selectedCount)}
          sx={{
            minWidth: 'auto',
            p: 0,
            fontSize: 11,
            lineHeight: 1.2,
            textTransform: 'none',
            color: '#4d4d4d',
            '&:hover': {
              backgroundColor: 'transparent',
              color: '#1b1b1b',
            },
          }}
        >
          {selectedCount === 0 ? 'Select all' : 'Deselect all'}
        </Button>
      </Box>

      <Stack spacing={0.5}>
        {categories.map((category) => {
            return Object.keys(normalizedState[category]).map((key) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isVisible(key,category)}
                  onChange={() => handleToggle(key,category)}
                  sx={checkboxStyles}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                    component="img"
                    src={normalizedState[category][key].icon ?? ''}
                    // alt={LABEL_MAP[key] || key}
                    sx={{ width: 20, height: 20, borderRadius: '4px', objectFit: 'cover' }}
                />
                <Typography sx={{ fontSize: 12, color: '#2f2f2f' }}>
                    {key}
                </Typography>
                </Box>
              }
              sx={{
                m: 0,
                width: '100%',
                '& .MuiFormControlLabel-label': {
                  userSelect: 'none',
                },
              }}
            />
          </Box>
        ))
        })}
      </Stack>
    </Box>
  );
};

export default ChartSubtypeFilter;
