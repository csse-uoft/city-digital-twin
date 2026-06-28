import db from '../db'
//AMENITY CATEGORIES
// set
export const setCachedAmenityCategories = async (cityURI,amenities,coords) => {
    console.log('CACHING amenity categories')
    console.log('cityURI: ', cityURI)
    console.log('mapCoords: ', coords)
    console.log('data: ', amenities)
    try {
        if (cityURI) {
            await db.amenityCategories.put({
                cityURI: cityURI,
                data: amenities,
                coordinates:coords,
                timestamp: Date.now()
            })
        }
    } catch (err) {
        console.error('ERR caching amenity categories: ',err)
    }
}

// get
export const getCachedAmenityCategories = async (cityURI) => {
    try {
        const record = await db.amenityCategories.get(cityURI)
        console.log('retrieved amenity category: ', record)
        return record
    } catch (err) {
        console.error('ERR getting cached amenity categories: ',err)
        return null
    }
}


//AMENITY DATA
export const setCachedAreaAmenities = async (areaIdentifier,amenities,cityURI) => {
    console.log('CACHING area amenities')
    console.log('cityURI: ',cityURI)
    console.log('area identifier: ',areaIdentifier)
    console.log('data: ',amenities)

    try {
        await db.amenityData.put({
            areaInstanceId: areaIdentifier,
            cityURI: cityURI,
            data: amenities,
            timestamp: Date.now()
        })
    } catch (err) {
        console.error('ERR caching area amenity data: ',err)
    }
}

export const getCachedAreaAmenities = async (areaIdentifier) => {
    try {
        const record = await db.amenityData.get(areaIdentifier)
        console.log('retrieved area amenities: ',record)
        return record
    } catch {
        console.error('ERR getting cached area amenity data: ',err)
        return null
    }
}