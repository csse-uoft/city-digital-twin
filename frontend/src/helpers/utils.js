import L from 'leaflet'


export const customAmenityMarker = (iconURL) => {

    const customIcon = L.icon({
        iconUrl: iconURL, // Or import from your assets,
        className:'',
        iconSize: [18, 18],              // Size of the icon
        iconAnchor: [9, 9],            // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -10]
    });
    return customIcon
}