import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const MapController = ({ coords }) => {
    const map = useMap();

    useEffect(() => {
        if (coords?.lat && coords?.lon) {
            map.setView([coords.lat, coords.lon], 12);
            // or map.flyTo([coords.lat, coords.lon], 12) for a smooth animation
        }
    }, [coords]);

    return null; // renders nothing, just controls the map
};

export default MapController