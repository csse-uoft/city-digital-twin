import L from 'leaflet'
import { renderToString } from 'react-dom/server';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ChurchOutlinedIcon from '@mui/icons-material/ChurchOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SportsBasketballOutlinedIcon from '@mui/icons-material/SportsBasketballOutlined';

const amenityCategories = {
    'Health': { color: '#EF4444', icon: '✚' },
    'Retail & Services': { color: '#FB923C', icon: <LocalMallOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
    'Education & Childcare':{ color: '#3B82F6', icon: <SchoolOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
    'Spiritual':{ color: '#A855F7', icon: <ChurchOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
    'Cultural':{ color: '#92400E', icon: <ColorLensOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
    'Communal':{ color: '#EC4899', icon: <PeopleAltOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
    'Recreational':{ color: '#22C55E', icon: <SportsBasketballOutlinedIcon style={{color:'white', height: '10px', width:'10px'}} /> },
};

export const customAmenityMarker = (amenityType) => {

    const iconColor = amenityCategories[amenityType].color
    const iconShape = amenityCategories[amenityType].icon

    const iconHtml = renderToString(<div style={{
            width: '18px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '10px',
            flexShrink: 0,
        }}>
            {iconShape}
        </div>) 

    const customIcon = new L.divIcon({
        html: iconHtml, // Or import from your assets,
        className:'',
        iconSize: [18, 18],              // Size of the icon
        iconAnchor: [9, 9],            // Point of the icon which will correspond to marker's location
    });
    return customIcon
}