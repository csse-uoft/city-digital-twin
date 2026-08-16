import React from 'react';
import { Box, Checkbox, FormControlLabel, Stack, Typography, Button } from '@mui/material';

const CATEGORY_ORDER = [
  'Health',
  'RetailAndServices',
  'EducationAndChildcare',
  'Cultural',
  'Communal',
  'Spiritual',
  'Recreational',
  'ParkService',
  'PublicTransitService',
];

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

const ChartCategoryFilter = ({
  categoryFilterState,
  onChange,
  title = 'Parameters',
}) => {
  const normalizedState = categoryFilterState || defaultState;
  const categories = Object.keys(categoryFilterState);

  const isVisible = (key) => {
    return categoryFilterState[key]?.show ?? false
  };

  const handleToggle = (key) => {
    const current = normalizedState[key];
    const nextValue = {
      ...(current && typeof current === 'object' ? current : { show: Boolean(current), icon: '' }),
      show: !isVisible(key),
    };

    onChange({
      ...normalizedState,
      [key]: nextValue,
    });
  };

  const handleDeselectAll = () => {
    const nextState = {...normalizedState}
    Object.keys(nextState).forEach((key) => {
        nextState[key].show = false
    })

    onChange(nextState);
  };

  const selectedCount = categories.filter((key) => isVisible(key)).length;

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 280,
        backgroundColor: '#fff',
        borderRadius: 2,
        p: 1,
        boxSizing: 'border-box',
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
          onClick={handleDeselectAll}
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
        {categories.map((key) => (
          <Box key={key} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isVisible(key)}
                  onChange={() => handleToggle(key)}
                  sx={checkboxStyles}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                    component="img"
                    src={categoryFilterState[key].icon ?? ''}
                    // alt={LABEL_MAP[key] || key}
                    sx={{ width: 20, height: 20, borderRadius: '4px', objectFit: 'cover' }}
                />
                <Typography sx={{ fontSize: 12, color: '#2f2f2f' }}>
                    {LABEL_MAP[key] || key}
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
        ))}
      </Stack>
    </Box>
  );
};

export default ChartCategoryFilter;
