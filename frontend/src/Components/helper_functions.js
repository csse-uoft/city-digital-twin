import Wkt from 'wicket';
import axios from "axios";


export const fetchCities = async (setCityURLs, setCities, cities) => {
    console.log("hello world")
    const response = await axios.get(
      `http://localhost:3000/api/0`
    );

    response.data.cityNames.forEach((URL, index) => {
      const [, cityName] = URL.split('#'); 
      
      setCityURLs(prevCityURLs => ({
        ...prevCityURLs,
        [cityName]: URL
      }));
      
      setCities([...cities, cityName]);
    })
  }
  
  export const fetchAdministration = async (city, cityURLs, setAdminURLs, setAdmin) => {
    if (city){
      try {
        const response = await axios.post('http://localhost:3000/api/2', {
          cityName: cityURLs[city]
        });
        setAdminURLs({'currCity': city}) //The current city is stored in the adminURL['currCity']
        response.data.adminAreaTypeNames.forEach((URL, index) => {
          const [, adminName] = URL.split('#'); 
        
          setAdminURLs(prevAdminURLs => ({
            ...prevAdminURLs,
            [adminName]: URL
          }));
        
          setAdmin(prevAdmin => [...prevAdmin, adminName]);
        });
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else{
      setAdminURLs({});
      setAdmin([]);
    }
  }

  export const fetchIndicators = async (city, cityURLs, setIndicatorURLs, setIndicators, indicators) => {
    if (city){
      try {
        const response = await axios.post('http://localhost:3000/api/1', {
          cityName: cityURLs[city]
        });
        console.log('response', response.data.indicatorNames);
        response.data.indicatorNames.forEach((URL, index) => {
          const [, indName] = URL.split('#'); 
        
          setIndicatorURLs(prevIndicatorURLs => ({
            ...prevIndicatorURLs,
            [indName]: URL
          }));
        
          setIndicators(prevIndicator => [...prevIndicator, indName]);
        });
        console.log('indicators', indicators)
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setIndicatorURLs({});
      setIndicators([]);
    }
  }

  export const fetchArea= async (admin, cityURLs, adminURLs, setAreaURLs, setArea) => {
    setAreaURLs({});
    setArea([]);
    if (admin){
      try {
        const response = await axios.post('http://localhost:3000/api/3', {
          cityName: cityURLs[adminURLs['currCity']],
          adminType: adminURLs[admin]
        });
        console.log('admin instances', response.data['adminAreaInstanceNames'])
        response.data['adminAreaInstanceNames'].forEach((Instance, index) => {
          setAreaURLs(prevAreaURLs => ({
            ...prevAreaURLs,
            [Instance['areaName']]: Instance['adminAreaInstance']
          }));
        
          setArea(prevArea => [...prevArea, Instance['areaName']]);
        });
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setAreaURLs({});
      setArea([]);
    }
  }

  export const fetchLocations = async (admin, cityURLs, adminURLs, locationURLs, setLocationURLs) => {
    setLocationURLs({});
    if (admin) {
      try {
        const response = await axios.post('http://localhost:3000/api/6', {
          cityName: cityURLs[adminURLs['currCity']],
          adminType: adminURLs[admin]
        });
        console.log('admin instances', response.data['adminAreaInstanceNames']);

        const updatedLocationURLs = {...locationURLs};
        response.data['adminAreaInstanceNames'].forEach((Instance, index) => {
          var wkt = new Wkt.Wkt();
          wkt.read(Instance['areaLocation']);

          var flipped = wkt.toJson();

          // The coordinates are FLIPPED in the database (Lon/Lat instead of Lat/Lon).
          // The code requires Lat/Lon, so flip it back.
          flipped.coordinates = flipped.coordinates.map(innerArray => innerArray.map(coords => [coords[1], coords[0]]));
          updatedLocationURLs[Instance['adminAreaInstance']] = flipped;             
        });
        setLocationURLs(updatedLocationURLs);
        console.log("locations", updatedLocationURLs);
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setLocationURLs({});
    }
  }


  export const handleAddIndicator = (selectedIndicators, setSelectedIndicators) => {
    const newId = Object.keys(selectedIndicators).length;
    const newValue = '';
    
    const newSelectedIndicators = { ...selectedIndicators, [newId]: newValue };
    setSelectedIndicators(newSelectedIndicators);
    
    console.log('add indicator:', newSelectedIndicators);
  };

  export const handleAddYears = (years, setYears) => {
    const temp = [...years];
    temp.push({
      value1: -1,
      value2: -1,
      id: years.length
    });
    setYears(temp);
    console.log(temp);
  }

  export const handleUpdateYear = (id, startOrEnd, event, years, setYears) => {
    var temp = years.slice(0, id);
    if (startOrEnd === "start") {
      temp.push({
        value1: event.target.value,
        value2: years[id].value2,
        id: id
      });
    } else {
      temp.push({
        value1: years[id].value1,
        value2: event.target.value,
        id: id
      });
    }
    
    if (years.slice(id+1).length !== 0) {
      temp.push(years.slice(id+1));
    }
    
    setYears(temp);
  };

  export const handleUpdateIndicators = (id, value, setSelectedIndicators) => {
    setSelectedIndicators(prevState => ({
      ...prevState,
      [id]: value
    }));
  };


  export const handleGenerateVisualization = async (years, cityURLs, adminURLs, indicatorURLs, selectedIndicators, currentAdminType, currentAdminInstance, showVisError, setMapPolygons, setShowVisError, setIndicatorData, setBeginGeneration, setShowingVisualization) => {
    const checkIfInputsFilled = () => {
      return (
        typeof(adminURLs['currCity']) !== 'undefined' &&
        typeof(currentAdminType) === 'string' && currentAdminType !== '' &&
        typeof(currentAdminInstance) === 'string' && currentAdminInstance !== ''  &&
        Object.keys(selectedIndicators).every(index => {return selectedIndicators[index] !== ''}) &&
        years.every((item) => {return item.value1 > 0 && item.value2 > 0})
      );
    };

    setMapPolygons([]);

    if (checkIfInputsFilled()) {
      if (showVisError) {
        setShowVisError(false);
      }
      
      setIndicatorData({});

      try {
        await Promise.all(Object.keys(selectedIndicators).map(async index => {
          const response = await axios.post('http://localhost:3000/api/4', {
            cityName: cityURLs[adminURLs['currCity']],
            adminType: currentAdminType,
            adminInstance: [currentAdminInstance],
            indicatorName: indicatorURLs[selectedIndicators[index]],
            startTime: years[parseInt(index)].value1,
            endTime: years[parseInt(index)].value2
          });
          
          console.log('final data', index, response.data['indicatorDataValues']);
          setIndicatorData(prevData => ({
            ...prevData,
            [indicatorURLs[selectedIndicators[index]]]: response.data['indicatorDataValues']
          }));
        }));
        setBeginGeneration(true);
      } catch (error) {
        console.error('POST Error:', error);
      }
    } else {
      setShowVisError(true);
      console.log("Can't generate visualization: missing data");
      setShowingVisualization(false);
    }
  }