import { useState } from 'react';
import { Box, Paper, Stack, Typography, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

//icons
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SportsBasketballOutlinedIcon from '@mui/icons-material/SportsBasketballOutlined';

const Legend = ({
  amenities
}) => {
  const [isOpen, setIsOpen] = useState(false);
  console.log('amenities: ', amenities)
  // const amenityCategories = [
  //   { id: 1, name: 'Health', color: '#EF4444', icon: '✚' },
  //   { id: 2, name: 'Retail & Services', color: '#FB923C', icon: <LocalMallOutlinedIcon color='white' /> },
  //   { id: 3, name: 'Education & Childcare', color: '#3B82F6', icon: <SchoolOutlinedIcon color='white' /> },
  //   { id: 4, name: 'Spiritual', color: '#A855F7', icon: <ChurchOutlinedIcon color='white' /> },
  //   { id: 5, name: 'Cultural', color: '#92400E', icon: <ColorLensOutlinedIcon color='white' /> },
  //   { id: 6, name: 'Communal', color: '#EC4899', icon: <PeopleAltOutlinedIcon color='white' /> },
  //   { id: 7, name: 'Recreational', color: '#22C55E', icon: <SportsBasketballOutlinedIcon color='white' /> },
  // ];

  const amenityCategories = Object.entries(amenities).map(([name,data]) => {
    return {
      name: name,
      colour: data.colour ?? '#ccc',
      icon: data.icon ?? '#'
    }
  })

  const toggleLegend = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Paper
      sx={{
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header - Always Visible */}
      <Box
        onClick={toggleLegend}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          backgroundColor: '#FFFFFF',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: '#F5F5F5',
          },
          transition: 'background-color 0.2s ease',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#202020',
          }}
        >
          Legend
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isOpen ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </Box>
      </Box>

      {/* Content - Collapsible */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Box
          sx={{
            borderTop: '1px solid #E5E5E5',
            backgroundColor: '#FAFAFA',
            padding: '16px',
          }}
        >
          <Stack spacing={2}>
            {amenityCategories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Icon Circle */}
                <img style={{}} src={category.icon} />

                {/* Label */}
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#424242',
                  }}
                >
                  {category.name}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default Legend;