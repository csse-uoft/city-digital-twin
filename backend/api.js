var express = require("express");
var router = express.Router();
const { polygon, centerOfMass } = require("@turf/turf");
var SparqlClient = require("sparql-http-client");
require("dotenv").config();

const endpointUrl = process.env.ENDPOINT_URL;

const endpointUrl2 = process.env.NEW_ENDPOINT_URL
// const client = new SparqlClient({ endpointUrl: endpointUrl });

const client2 = new SparqlClient({ endpointUrl: endpointUrl2 })

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizeSparqlQuery(query) {
  return query.replace(/[\u00A0\u2000-\u200B\u2002-\u200F\u2028\u2029\u202F\u205F\u3000]/g, ' ');
}

function geoJsonPolygon(coords) {
  return turf.polygon(coords)
}

function parsePointCoords (coordStr) {
  const match = coordStr.match(/\((.*)\)/)
  if (match) {
    // console.log('coordinate match: ',match[1])
    const coords = match[1].split(' ')
    const lon = parseFloat(coords[0].replace(/[^0-9.-]+/g, ""))
    const lat = parseFloat(coords[1].replace(/[^0-9.-]+/g, ""))
    return {
      lat: lat,
      lon: lon
    }
  } else {
    return null
  }
}

function parsePolygonCoords (coordStr) {
  const match = coordStr.match(/\((.*)\)/)
  if (match) {
    const coordList = match[1].split(',')
    const arr = coordList.map((data) => {
      const coords = data.trim().split(' ')
      const lon = parseFloat(coords[0].replace(/[^0-9.-]+/g, ""))
      const lat = parseFloat(coords[1].replace(/[^0-9.-]+/g, ""))
      return [lat,lon]
    })
    return arr
  } else {
    return null
  }
}

function parseMapCoords (coordStr,category) {
  //check if it is a point or a polygon
  // console.log('parse map coordStr: ',coordStr)
  if (coordStr) {
    const type = coordStr.split(' ').at(0)
    // console.log('type: ',type)
    if (type === 'POINT') {
      return {
        coords: parsePointCoords(coordStr),
        type: 'point'
      }
    } 
    else if (type === 'POLYGON' && category === 'ParkService') {
      return {
        coords: parsePolygonCoords(coordStr),
        type: 'polygon'
      }
    } else if (type === 'POLYGON' && category != 'ParkService') { //convert polygon to central point
      const coords = parsePolygonCoords(coordStr)
      console.log('COORDS FOR TURF: ',coords)
      const p = centerOfMass(polygon([coords]))
      return {
        coords: {
          lat: p.geometry.coordinates[0],
          lon: p.geometry.coordinates[1]
        },
        type: 'point'
      }
    } else {
      return null
    }
  } else {
    return null
  }
  
}
function parseAmenityCategory(uri) {
  return uri ? uri.split('/').at(-1).replace('Amenity','') : ''
}


function transformAreaAmenities (amenityData,subTypeMap) {
  // console.log('area amenities: ', amenityData)
  const amenities = amenityData.map((item) => {
    const type = parseAmenityCategory(item?.class?.value)
    if (Object.hasOwnProperty.call(subTypeMap, type)) {
      //depending on the type, may need to convert to polygon
      const data = parseMapCoords(item?.pwkt?.value,type)
      const category = parseAmenityCategory(item?.class?.value)
      const subCategory = parseAmenityCategory(item?.class?.value)
      const name = item?.name?.value ?? 'Public Transit'

      return {
        category: subTypeMap[type],
        subCategory: subCategory,
        type: data?.type,
        mapCoords: data?.coords,
        name: name
      }
    } else {
      return null
    }
    
  })
  
  return amenities.filter(k => k != null)
}

function formatAmenities (amenityData,subTypeMap) {
  let data = {}
  amenityData.forEach((item) => {
    data[item.category] ??= {}
    data[item.category][item.subCategory] = [...(data[item.category][item.subCategory] ?? []), item]
  })

  console.log('formatted amenity data for filter panel: ', data)
  return data
}

function transformAmenityCategories (amenityData) {
  console.log('amenity categories: ',amenityData)
  let amenities = {}

  amenityData.forEach((amenity) => {
    const label = amenity?.d_label?.value
    const name = amenity.d.value.split('/').at(-1).replace('Amenity','')
    console.log('name: ',name)
    const colour = amenity?.colour?.value ?? null
    const iconUrl = amenity?.icon?.value ?? null
    if (name) {
      
      amenities[name] = {
        colour: colour,
        icon: iconUrl,
        label:label
      }
    }
    
  })

  return amenities
}

function transformWalkabilityData (data) {
  let obj = {}
  data.forEach((item) => {
    const label = parseAmenityCategory(item?.class?.value ?? '')
    obj[label] = {
      totalBuildingCount: parseInt(item?.totalBuildingCount?.value),
      buildingsWithin400mCount: parseInt(item?.buildingsWithin400mCount?.value)
    }
  })

  return obj
}



function formatWalkability (data,amenityCategories) {

  const transformedWalkabilityData = transformWalkabilityData(data)
  console.log('transformed walkability data: ', transformedWalkabilityData)
  console.log('format walkability amenity categories: ',amenityCategories)
  scores = {}

  Object.keys(amenityCategories).forEach((category,index) => {
    //check whether the walkability data contains this category
    if (Object.hasOwn(transformedWalkabilityData, category)) {
      // add this category to the new structure
      const highLevelCategoryWalkability = transformedWalkabilityData[category]?.buildingsWithin400mCount / transformedWalkabilityData[category]?.totalBuildingCount
      scores[category] = { walkability: highLevelCategoryWalkability, subtypes: [], color: amenityCategories[category]?.colour ?? 'ccc'}
    }

    //now check it's subtypes
    const subtypes = amenityCategories[category].subtypes
    subtypes?.forEach((subtype) => {
      //check whether the walkability data contains this subtype
      if (Object.hasOwn(transformedWalkabilityData, subtype)) {
        const subtypeWalkability = transformedWalkabilityData[subtype]?.buildingsWithin400mCount / transformedWalkabilityData[subtype]?.totalBuildingCount
        scores[category].subtypes?.push({subtype: subtype, walkability: subtypeWalkability})
      }
    })
  })

  console.dir(scores, {depth: null})

  return scores

}

// Test if backend recieve the call from frontend
router.get("/health-check", async (req, res) => {
  res.json({ success: true, message: "success" });
});

// API 0: Check Backend Documentation file for more information.
router.get("/cities", async (req, res) => {
  /*
  Output: Array of city URIs.
  Description: Gets a list of available cities in the connected database.
  */

  try {
    const query = `
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT ?city WHERE {
        ?city rdf:type i50872:City.
      }
    `;

    const stream = await client2.query.select(query);

    let result = [];
    let totalResults = 0;

    stream.on("data", (row) => {
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
        totalResults++;
      });
    });

    stream.on("end", () => {
      res.json({
        message: "success",
        cityNames: result,
        totalResults: totalResults,
      });
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).send("Oops, stream error!");
    });
  } catch (err) {
    console.error("Query error when fetching all cities:", err);
    res.status(500).send("Oops, query failed!");
  }
});

// API 1: Check Backend Documentation file for more information.
router.get("/indicators", async (req, res) => {
  /*
  Output: Array of administrative area type URIs.
  Description: Gets a list of available data indicators for the given city.
  */
  try {
    const query = `
      PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      SELECT DISTINCT ?class
      FROM NAMED <http://www.ontotext.com/implicit>
      FROM NAMED <http://www.ontotext.com/explicit>
      WHERE {
          ?class rdfs:subClassOf iso21972:Indicator.
        
          GRAPH <http://www.ontotext.com/explicit> {  
            ?instance a ?class;
                      iso21972:value ?measure.  
          }
      }
    `;

    const stream = await client2.query.select(query);

    let result = [];
    let totalResults = 0;

    stream.on("data", (row) => {
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
        totalResults++;
      });
    });

    stream.on("end", () => {
      res.json({
        message: "success",
        indicatorNames: result,
        totalResults: totalResults,
      });
    });

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).send("Oops, stream error!");
    });
  } catch (err) {
    console.error("Query error when fetching all indicators:", err);
    res.status(500).send("Oops, query failed!");
  }
});

// API 2: Check Backend Documentation file for more information.
router.post("/admin-types", async (req, res) => {
  /*
  Input form: {cityName: "http://ontology.eil.utoronto.ca/5087/2/City#Toronto"}
  Output: JSON list of all administrative area types
  Description: Get all administrative area types (ward, neighbourhood, etc.) for a given city
  */
  if (!includesAllInputs([req.body.cityName], "string")) {
    res.status(400);
    res.json({ message: "Bad request: missing cityName" });
  } else if (!isURI(req.body.cityName)) {
    res.status(400);
    res.json({ message: "Bad request: cityName is not an URI" });
  } else {
    const [prefix, suffix] = splitURI(req.body.cityName);
    console.log(`ADMIN TYPES API prefix: ${prefix}, suffex: ${suffix}`)

    const query = `
      PREFIX CITY: <${prefix}>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT DISTINCT ?AdminAreaType WHERE {
          
          ?AdminArea rdf:type ?AdminAreaType.
          ?AdminAreaType rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `;
    //CITY:${suffix} ?p ?AdminArea.
    // Check if city is in database; if not, quit
    const doesCityExist = await client2.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${suffix} rdf:type i50872:City.
      }
    `);

    if (!doesCityExist) {
      res.status(400);
      res.json({ message: "Bad request: Provided city does not exist" });
    } else {
      const stream = await client2.query.select(query);

      var result = [];

      stream.on("data", (row) => {
        // Version for simply putting each result value into the final array
        Object.entries(row).forEach(([key, value]) => {
          result.push(value.value);
        });
        console.log('admin types result: ',result)
      });

      stream.on("end", () => {
        res.json({ message: "success", adminAreaTypeNames: result });
      });

      stream.on("error", (err) => {
        res.status(500).send("Oops, error!");
      });
    }
  }
});

// API 3: Check Backend Documentation file for more information.
router.post("/admin-instances", async (req, res) => {
  /*
  Input form: {"cityName":"http://ontology.eil.utoronto.ca/5087/2/City#Toronto", "adminType":"http://ontology.eil.utoronto.ca/Toronto/Toronto#Neighbourhood"}
  Output: JSON list of all administrative area instances with the URI and the human-readable name included.
  Description: Gets a list of all instances of a particular administrative area type.
  */
  if (!includesAllInputs([req.body.cityName, req.body.adminType], "string")) {
    res.status(400);
    res.json({
      message: "Bad request: missing or non-string cityName or adminType",
    });
  } else if (!isURI(req.body.cityName) || !isURI(req.body.adminType)) {
    res.status(400);
    res.json({ message: "Bad request: cityName or adminType is not an URI" });
  } else {
    const [prefix, citySuffix] = splitURI(req.body.cityName);
    const [, adminTypeSuffix] = splitURI(req.body.adminType);

    const query = `
      PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
      PREFIX CITY: <${prefix}>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      SELECT DISTINCT ?adminAreaInstance ?areaName  WHERE {
      CITY:${citySuffix} ?p ?adminAreaInstance.
      ?adminAreaInstance genprop:hasName ?areaName.
      ?adminAreaInstance rdf:type CITY:${adminTypeSuffix}.
      }
    `;
    // const query = `
    // PREFIX CITY: <${prefix}>
    // PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    // PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

    // SELECT DISTINCT ?adminAreaInstance ?areaName  WHERE {
    // CITY:${citySuffix} ?p ?adminAreaInstance.
    // ?adminAreaInstance rdfs:comment ?areaName.
    // ?adminAreaInstance rdf:type CITY:${adminTypeSuffix}.
    // }`
    //CITY:${citySuffix} ?p ?adminAreaInstance.

    // Check if city is in database; if not, quit
    const doesCityExist = await client2.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client2.query.ask(`
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      ASK {
          
      }
    `);

    // const doesAdminAreaTypeExist = await client2.query.ask(`
    //   PREFIX CITY: <${prefix}>
    //   PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
    //   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    //   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
    //   ASK {
    //       CITY:${citySuffix} ?p ?AdminArea.
    //       ?AdminArea rdf:type CITY:${adminTypeSuffix}.
    //       CITY:${adminTypeSuffix} rdfs:subClassOf iso50872:CityAdministrativeArea.
    //   }
    // `);

    if (!doesCityExist || !doesAdminAreaTypeExist) {
      if (!doesCityExist) {
        res.status(400);
        res.json({ message: "Bad request: Provided city does not exist" });
      } else {
        res.status(400);
        res.json({
          message:
            "Bad request: Provided administrative area type does not exist",
        });
      }
    } else {
      const stream = await client2.query.select(query);

      var result = [];
      var totalResults = 0;

      stream.on("data", (row) => {
        var singleRow = {};
        Object.entries(row).forEach(([key, value]) => {
          singleRow[key] = value.value?.split('_').join('').replace('neighbourhood','neighborhood');
        });
        result.push(singleRow);
        totalResults++;
      });

      stream.on("end", () => {
        res.json({
          message: "success",
          adminAreaInstanceNames: result,
          totalResults: totalResults,
        });
      });

      stream.on("error", (err) => {
        res.status(500).send("Oops, error!");
      });
    }
  }
});

// API 4: Check Backend Documentation file for more information.
router.post("/visualization-data", async (req, res) => {
  /*
  Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance), indicators (indicatorNames), time range (timeStart, timeEnd)
  Output: Corresponding visualization and indicator data from connected database
  Description: Given an administrative area instance, an indicator, and a time range, return the corresponding indicator data. 
  Allows for multiple admin area instances.
  */

  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!req.body.cityName) {
    res.status(400);
    res.json({ message: "Bad request: missing cityName" });
    return;
  } else if (!req.body.adminType) {
    res.status(400);
    res.json({ message: "Bad request: missing adminType" });
    return;
  } else if (
    !req.body.adminInstance ||
    !Array.isArray(req.body.adminInstance)
  ) {
    res.status(400);
    res.json({ message: "Bad request: missing or non-array adminInstance" });
    return;
  } else if (!req.body.indicatorName) {
    res.status(400);
    res.json({ message: "Bad request: missing indicatorName" });
    return;
  } else if (!req.body.startTime || !req.body.endTime) {
    res.status(400);
    res.json({ message: "Bad request: missing date" });
    return;
    // ----------- ALL REQUEST VARIABLES PROVIDED ----------
  } else {
    const cityPrefix = String(req.body.cityName).split("#")[0];
    const citySuffix = String(req.body.cityName).split("#")[1];

    const adminTypeSuffix = String(req.body.adminType).split("#")[1];

    const indicatorPrefix = String(req.body.indicatorName).split("#")[0];
    const indicatorSuffix = String(req.body.indicatorName)
      .split("#")[1]
      .slice(0, -4);

    const startTime = parseInt(req.body.startTime);
    const endTime = parseInt(req.body.endTime);

    const adminInstanceSuffix = Array.isArray(req.body.adminInstance)
      ? req.body.adminInstance.map((instance) => {
          return String(instance).split("#")[1];
        })
      : String(req.body.adminInstance).split("#")[1];

    var finalResult = {};

    // Check if provided city exists; if not, exit
    const doesCityExist = await client2.query.ask(`
      PREFIX CITY: <${cityPrefix}#>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    if (!doesCityExist) {
      res.status(400);
      res.json({ message: "Bad request: Provided city does not exist" });
      return;
    }

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client2.query.ask(`
      PREFIX CITY: <${cityPrefix}#>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      ASK {
          CITY:${citySuffix} ?p ?AdminArea.
          ?AdminArea rdf:type CITY:${adminTypeSuffix}.
          CITY:${adminTypeSuffix} rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `);
    if (!doesAdminAreaTypeExist) {
      res.status(400);
      res.json({
        message:
          "Bad request: Provided administrative area type does not exist",
      });
      return;
    }

    var adminAreaTypeNames = [];

    // Get list of admin area type names
    const adminAreaTypeNameStream = await client2.query.select(`
      PREFIX CITY: <${cityPrefix}#>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT DISTINCT ?AdminAreaType WHERE {
          CITY:${citySuffix} ?p ?AdminArea.
          ?AdminArea rdf:type ?AdminAreaType.
          ?AdminAreaType rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `);

    //Selected Adminstrative Area Type will not be added to adminAreaTypeNames
    adminAreaTypeNameStream.on("data", (row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (String(value.value).split("#")[1] !== adminTypeSuffix) {
          adminAreaTypeNames.push(String(value.value).split("#")[1]);
        }
      });
    });

    adminAreaTypeNameStream.on("end", async () => {
      for (let instance in adminInstanceSuffix) {
        var instanceResult = {};
        for (let year = startTime; year <= endTime + 1; year++) {
          const indicatorSuffixWithYear = indicatorSuffix + String(year);

          // Determine if each indicator exist for given admin Type
          var notSameAdminType = "";
          var isIndicatorAdminTypeSame = null;
          var countIsIndicatorAdminTypeSame = 0;

          while (countIsIndicatorAdminTypeSame < 3) {
            try {
              await sleep(200); // Sleep for 0.2 seconds
              isIndicatorAdminTypeSame = await client2.query.ask(`
                PREFIX INDICATOR: <${indicatorPrefix}#>
                PREFIX CITY: <${cityPrefix}#>
                PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
    
                ASK {
                  ?area a iso50872:CityAdministrativeArea.
                  ?indicator a INDICATOR:${indicatorSuffixWithYear};
                  ?p ?area.
                  ?area a CITY:${adminTypeSuffix}.
                }
              `);
              break;
            } catch (err) {
              console.log("isIndicatorAdminTypeSame error: ", err);
            }
          }

          if (!isIndicatorAdminTypeSame) {
            // Find the area type with matching data
            for (let adminArea in adminAreaTypeNames) {
              var isAdminTypeMatching;
              var count = 0;
              var success = false;
              var error = "";
              while (count < 3) {
                try {
                  await sleep(200); // Sleep for 0.2 seconds
                  isAdminTypeMatching = await client2.query.ask(`
                    PREFIX INDICATOR: <${indicatorPrefix}#>
                    PREFIX CITY: <${cityPrefix}#>
                    PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
                  
                    ASK {
                      ?area a iso50872:CityAdministrativeArea.
                      ?indicator a INDICATOR:${indicatorSuffixWithYear};
                      ?p ?area.
                      ?area a CITY:${adminAreaTypeNames[adminArea]}.
                    }
                  `);
                  success = true;
                } catch (err) {
                  error = err;
                  console.log(
                    "!~~~~~~~ Error executing SPARQL query, retry now, error: ",
                    err
                  );
                }

                if (success) {
                  break;
                }
              }

              if (!success) {
                // Handle and log the error
                console.error("Error executing SPARQL query:", err);
                res
                  .status(500)
                  .json({ message: "Oops, something went wrong!", err: err });
                return;
              }

              if (isAdminTypeMatching) {
                notSameAdminType = adminArea;

                // Also determine which of the new admin areas overlap with the old area, if an adminInstance was provided
                // If data is only available at a LARGER admin area, return an error (no way to split it down)
                var overlappingAreaList = [];

                const overlappingAdminAreas = await client2.query.select(`
                  PREFIX CITY: <${cityPrefix}#>
                  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                  PREFIX iso5087m: <http://ontology.eil.utoronto.ca/5087/1/Mereology/>
                  
                  SELECT ?overlappingArea WHERE {
                      CITY:${adminInstanceSuffix[instance]} iso5087m:hasProperPart ?overlappingArea.
                      ?overlappingArea rdf:type CITY:${adminAreaTypeNames[adminArea]}.
                  }
                `);

                overlappingAdminAreas.on("data", (row) => {
                  Object.entries(row).forEach(([key, value]) => {
                    overlappingAreaList.push(String(value.value).split("#")[1]);
                  });
                });

                overlappingAdminAreas.on("end", async () => {
                  var result = 0;
                  if (overlappingAreaList.length === 0) {
                    try {
                      // res.status(500); // COMMENTED OUT BECAUSE OTHERWISE IT CRASHES WHEN DOING CENSUS TRACTS
                      // res.json({message:"Bad request: No indicator data for given admin area type or smaller"});
                      return;
                    } catch (error) {
                      console.error("Error executing SPARQL query:", error);
                      res.status(500).json({
                        message:
                          "Oops, something went wrong! (census tract crutch triggered)",
                        err: error,
                      });
                      return;
                    }
                  } else {
                    // Function to process batches

                    async function processBatch(batch) {
                      return new Promise(async (resolve, reject) => {
                        let batchQuery = `
                          PREFIX CITY: <${cityPrefix}#>
                          PREFIX INDICATOR: <${indicatorPrefix}#>
                          PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>
                    
                          SELECT ?value WHERE { 
                        `;

                        batch.forEach((overlappingArea, index) => {
                          if (index !== 0)
                            batchQuery += `
                            UNION
                          `;

                          batchQuery += `
                            {INDICATOR:${overlappingArea}${indicatorSuffixWithYear} iso21972:value ?measure.
                            ?measure iso21972:numerical_value ?value.}
                          `;
                        });

                        batchQuery += "}";
                        batchQuery = batchQuery.replace(/(\r\n|\n|\r)/gm, "");

                        try {
                          const batchResult = await client2.query.select(
                            batchQuery
                          );
                          let batchTotal = 0;
                          let hasData = false;

                          batchResult.on("data", (row) => {
                            hasData = true;
                            const temp = parseInt(row.value.value);

                            if (!Number.isNaN(temp)) {
                              batchTotal += temp;
                            }
                          });

                          batchResult.on("end", () => {
                            resolve({ hasData, batchTotal });
                          });

                          batchResult.on("error", (err) => {
                            reject(err);
                          });
                        } catch (error) {
                          reject(error);
                        }
                      });
                    }

                    try {
                      // Split `overlappingAreaList` into batches of 10
                      const batchSize = 10;
                      const batches = [];
                      for (
                        let i = 0;
                        i < overlappingAreaList.length;
                        i += batchSize
                      ) {
                        batches.push(
                          overlappingAreaList.slice(i, i + batchSize)
                        );
                      }

                      // Process each batch sequentially
                      for (const batch of batches) {
                        const { hasData, batchTotal } = await processBatch(
                          batch
                        );

                        if (hasData) {
                          result += batchTotal;
                        }
                      }
                      if (year <= endTime) {
                        instanceResult[year] = result || 0; // Assign NaN if no data
                      }
                    } catch (error) {
                      // res.status(500).json({ message: 'Oops, error during batch processing!', error });
                      // return;
                    }
                  }
                });
              }
            }

            if (notSameAdminType === "") {
              if (year <= endTime) {
                instanceResult[year] = NaN;
              }
            }
          } else {
            var result = 0;

            indicatorDataStream = await client2.query.select(`
              PREFIX CITY: <${cityPrefix}#>
              PREFIX INDICATOR: <${indicatorPrefix}#>
              PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

              SELECT ?value WHERE {
                INDICATOR:${adminInstanceSuffix[instance]}${indicatorSuffixWithYear} iso21972:value ?measure.
                ?measure iso21972:numerical_value ?value.
              }
            `);

            var hasData = false;

            indicatorDataStream.on("data", (row) => {
              Object.entries(row).forEach(([key, value]) => {
                hasData = true;
                temp = parseInt(value.value);

                // Only add new value to result if it's a number, else return an error
                if (!Number.isNaN(temp)) {
                  result += temp;
                } else {
                  if (year <= endTime) {
                    instanceResult[year] = NaN;
                  }
                }
              });
            });

            indicatorDataStream.on("end", () => {
              if (!hasData) {
                if (year <= endTime) {
                  instanceResult[year] = NaN;
                }
              } else {
                if (year <= endTime) {
                  instanceResult[year] = result;
                }
              }
            });

            indicatorDataStream.on("error", (err) => {
              res.status(500).send("Oops, error!");
              return;
            });
          }
        }
        finalResult[[`${cityPrefix}#${adminInstanceSuffix[instance]}`]] =
          instanceResult;
      }
      res.json({ message: "success", indicatorDataValues: finalResult });
    });

    adminAreaTypeNameStream.on("error", (err) => {
      // res.status(500).send('Oops, error!');
      return;
    });
  }
});

// API 5
router.post("/5", async (req, res) => {
  // Select a property (or all matching properties) for a given subject

  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!includesAllInputs([req.body.predicate, req.body.subject], "string")) {
    res.status(400);
    res.json({
      message:
        "Bad request: missing required input(s) (cityName, predicate, or subject)",
    });
  } else if (!isURI(req.body.predicate) || !isURI(req.body.subject)) {
    res.status(400);
    res.json({ message: "Bad request: predicate or subject is not an URI" });
  } else {
    const [predicatePrefix, predicateSuffix] = splitURI(req.body.predicate);
    const [subjectPrefix, subjectSuffix] = splitURI(req.body.subject);

    const stream = await client2.query.select(`
      PREFIX FINDFROM: <${subjectPrefix}>
      PREFIX PROPERTY: <${predicatePrefix}>

      SELECT ?propertyValue WHERE {
        FINDFROM:${subjectSuffix} PROPERTY:${predicateSuffix} ?propertyValue.
      }
    `);

    var result = [];
    var totalResults = 0;

    stream.on("data", (row) => {
      // Version for simply putting each result value into the final array
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
        totalResults++;
      });
    });

    stream.on("end", () => {
      res.json({
        message: "success",
        propertyValue: result,
        totalResults: totalResults,
      });
    });

    stream.on("error", (err) => {
      res.status(500).send("Oops, error!", err);
    });
  }
});

// API 6
router.post("/6", async (req, res) => {
  /*
  Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance)
  Output: Return all the geoWKT location data.
  Description: Gets a list of all administrative instance locations of a particular area type.
  */
  if (!includesAllInputs([req.body.cityName, req.body.adminType], "string")) {
    res.status(400);
    res.json({
      message: "Bad request: missing or non-string cityName or adminType",
    });
  } else if (!isURI(req.body.cityName) || !isURI(req.body.adminType)) {
    res.status(400);
    res.json({ message: "Bad request: cityName or adminType is not an URI" });
  } else {
    const [prefix, citySuffix] = splitURI(req.body.cityName);
    const [, adminTypeSuffix] = splitURI(req.body.adminType);
    console.log('API 6')
    console.log(`prefix: ${prefix}, citySuffix: ${citySuffix}, adminTypeSuffix: ${adminTypeSuffix}`)
    const query = `
      PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
#PREFIX CITY: <${prefix}>
      PREFIX iso50872City: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
      PREFIX iso50871Loc: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>

      SELECT DISTINCT ?adminAreaInstance ?areaLocation WHERE {
 #       CITY:${citySuffix} ?p ?adminAreaInstance.
        ?adminAreaInstance rdfs:comment ?areaName.
        ?adminAreaInstance rdf:type tor:${adminTypeSuffix}.
        ?adminAreaInstance loc:hasLocation ?loc.
        ?loc geo:asWKT ?areaLocation.
      }
    `;
    //
    //CITY:${citySuffix} ?p ?adminAreaInstance.
    // Check if city is in database; if not, quit
    const doesCityExist = await client2.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client2.query.ask(`
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      ASK {
          
      }
    `);

    // const doesAdminAreaTypeExist = await client2.query.ask(`
    //   PREFIX CITY: <${prefix}>
    //   PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
    //   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    //   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
    //   ASK {
    //       CITY:${citySuffix} ?p ?AdminArea.
    //       ?AdminArea rdf:type CITY:${adminTypeSuffix}.
    //       CITY:${adminTypeSuffix} rdfs:subClassOf iso50872:CityAdministrativeArea.
    //   }
    // `);

    

    if (!doesCityExist || !doesAdminAreaTypeExist) {
      if (!doesCityExist) {
        res.status(400);
        res.json({ message: "Bad request: Provided city does not exist" });
      } else {
        res.status(400);
        res.json({
          message:
            "Bad request: Provided administrative area type does not exist",
        });
      }
    } else {
      const stream = await client2.query.select(query);

      var result = [];
      var totalResults = 0;

      stream.on("data", (row) => {
        var singleRow = {};
        Object.entries(row).forEach(([key, value]) => {
          singleRow[key] = value.value;
        });
        result.push(singleRow);
        totalResults++;
      });

      stream.on("end", () => {
        // console.log('area instance names: ',result)
        console.log('total results: ', totalResults)
        res.json({
          message: "success",
          adminAreaInstanceNames: result,
          totalResults: totalResults,
        });
      });

      stream.on("error", (err) => {
        res.status(500).send("Oops, error!");
      });
    }
  }
});

// API 7
router.get("/all-amenity-URLs", async (req, res) => {
  // Return all urls for all amenities
  // Sample output: ["http://ontology.eil.utoronto.ca/GCI/Recreation/GCIRecreation.owl#Park","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#School","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PublicMiddleSchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PublicPrimarySchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PrivateSchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PrivateMiddleSchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PrivatePrimarySchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PrivateSecondarySchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PublicSchool","http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#PublicSecondarySchool","http://ontology.eil.utoronto.ca/CDT#Kindergarten","http://ontology.eil.utoronto.ca/CDT#College","http://ontology.eil.utoronto.ca/CDT#University","http://ontology.eil.utoronto.ca/CDT#Supermarket","http://ontology.eil.utoronto.ca/CDT#Greengrocer","http://ontology.eil.utoronto.ca/CDT#Clinic","http://ontology.eil.utoronto.ca/CDT#DoctorsOffice","http://ontology.eil.utoronto.ca/CDT#Pharmacy","http://schema.org/Hospital","http://ontology.eil.utoronto.ca/GCI/Health/GCI-Health.owl#PublicHospital","http://ontology.eil.utoronto.ca/GCI/Health/GCI-Health.owl#PrivateHospital"]

  // Query to use for accessing urls
  const amenityClassesQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>

    SELECT ?amenity
    WHERE {
        ?amenity rdfs:subClassOf cdt:CompleteCommunityAmenity.
    }
  `;

  try {
    // Execute the first query for amenity classes
    const stream = await client2.query.select(amenityClassesQuery);

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row.amenity.value); // Collect each result row
    });

    stream.on("end", () => {
      // Format the data
      // Send the formatted data as JSON response
      res.json({ success: true, urls: rawData });
    });

    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).send("An error occurred while executing the query");
  }
});

// API 8
router.post("/amenity-location-all", async (req, res) => {
  // Description: Retrieves amenities that intersect with a given neighborhood/location in Toronto.
  // The neighborhood/location is specified by `location_id`, which should match a class name in the ontology (e.g., toronto:neighborhood70).
  // Output: Corresponding visualization and indicator data from connected database

  // Extract location_id from the request body
  const location_id = req.body.location_id;
  console.log('locationId: ', location_id)

  // SPARQL query to retrieve amenities intersecting with the specified location
  const query = `
    PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
    PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
    PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

    SELECT ?type ?color ?amenity ?id ?name ?coordinates

    WHERE {
      ?amenity a cdt:CompleteCommunityAmenity;
      cdt:osmID ?id;
      loc:hasLocation ?location.

      GRAPH <http://www.ontotext.com/explicit> {  
        ?amenity a ?type;
      }    

      OPTIONAL {
          GRAPH <http://www.ontotext.com/explicit> {
              ?type cdt:displayColor ?color
          }
      }
              
      OPTIONAL {?amenity genprop:hasName ?name}

      ?location geo:asWKT ?coordinates.
      toronto:${location_id} iso50871:hasLocation ?neighlocation.
      ?neighlocation geo:asWKT ?neighcoordinates.
      FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
    }
  `;
  try {
    // Execute the first query for amenity classes
    const stream = await client2.query.select(query);
    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });
    stream.on("end", () => {
      console.log('rawData: ', rawData)
      const formattedData = rawData.map((binding) => {
        var amenity_tp = "";
        if (binding.amenity) {
          const url = binding.amenity.value;
          const match = url.match(/#\d+([A-Za-z]+)$/);
          if (match) {
            amenity_tp = match[1];
          }
        }

        return {
          amenity: binding.amenity ? binding.amenity.value : null,
          type: binding.type ? binding.type.value : null,
          amenityType: amenity_tp,
          name: binding.name ? binding.name.value : null,
          coordinates: binding.coordinates ? binding.coordinates.value : null,
          color: binding.color ? binding.color.value : null,
        };
      });
      // console.log('formatted data: ', formattedData)
      // Send the formatted data as JSON
      res.json({ success: true, data: formattedData });
    });

    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (error) {
    console.error("Execution error:", error);
    res.status(500).send("An error occurred while executing the query");
  }
});

// API 9
router.post("/amenity-score", async (req, res) => {
  // Returns metrics describing how easily a amenties is accessible by all neighbourhoods
  // NOTE, for now only fetch score for neighbourhoods
  const adminType = req.body.adminType;
  console.log(adminType);
  try {
    // update this query once you know how to query other type of adminType
    const query = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
      PREFIX uoft: <http://ontology.eil.utoronto.ca/tove/cacensus#>
      PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

      SELECT ?type ?name ?value

      WHERE{
          ?neighbourhood a toronto:Neighborhood;
          rdfs:comment ?name.

          ?indicator a cdt:PercentWalkingDistance;
          uoft:hasLocation ?neighbourhood;
        iso21972:value ?measure.
        
          GRAPH <http://www.ontotext.com/explicit> {  
        ?indicator a ?type;
        }    
        
        ?measure iso21972:numerical_value ?value.
      }
    `;

    // Execute the query
    const stream = await client2.query.select(query);

    // Collect results from the stream
    const results = [];
    stream.on("data", (row) => {
      results.push({
        type: row.type.value,
        name: row.name.value,
        value: row.value.value,
      });
    });

    // Handle stream end (when all data has been processed)
    stream.on("end", () => {
      res.json(results); // Send the collected results as JSON response
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error: ", err);
    res.status(500).send("Internal server error");
  }
});

// API 10
router.post("/neighborhood-amenities", async (req,res) => {
  const neighborhoodURI = req.body.neighborhoodURI
  const amenityURI = req.body.amenityURI
  console.log('API 10')
  console.log('neighborhood URI: ', neighborhoodURI)
  console.log('amneityURI: ',amenityURI)

  try {
    const query = `
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX i72: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>
      PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
      PREFIX cdt_old: <http://ontology.eil.utoronto.ca/CDT#>
      PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
      PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
      PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
      PREFIX cacensus: <http://ontology.eil.utoronto.ca/tove/cacensus#>
      PREFIX cdt_temp: <http://ontology.eil.utoronto.ca/CDT_temp_extension/>

      SELECT ?score 

      WHERE {
          ?i a cdt_old:PercentWalkingDistance;
          cacensus:hasLocation <${neighborhoodURI}>;	#?x is the neighbourhood identifier
          i72:numerator [i72:cardinality_of ?pop].

          ?i i72:hasValue [i72:hasNumericalValue ?score].

          ?pop rdf:type ?popclass.
          ?popclass rdfs:subClassOf [
                  rdf:type owl:Restriction;
              owl:onProperty i72:defined_by;
              owl:allValuesFrom [ rdf:type owl:Restriction;
                  owl:onProperty cdt_temp:walkingDistanceFrom;
                  owl:someValuesFrom <${amenityURI}>	#cdt:ParkService is the amenity type identifier
                  #TODO extend CDT_temp for other available amenities in this repo
              ]
          ]
      }
    `

    // Execute the query
    const stream = await client2.query.select(query);

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", () => {
      console.log("neighborhood amenities result: ", rawData)

      // Send the formatted data as JSON
      res.json({ success: true, data: rawData });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error: ", err);
    res.status(500).send("Internal server error");
  }
})

// API 11 (new endpoint)
router.post("/map-coords", async (req,res) => {
  const cityURI = req.body.cityURI
  console.log('city uri id for map-coords: ',cityURI)
  try {
    const query = `
    PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
    PREFIX config: <http://ontology.eil.utoronto.ca/CDT_Config/>
    select ?coord where {
        #where t is the input parameter of a city's URI
        <${cityURI}> config:hasDashboardConfig ?x.
        ?x a config:CompleteCommunitiesDashboardConfig.
        ?x config:mapWktCentre ?coord.
      }
    `
    
    // Execute the query
    const stream = await client2.query.select(query);
    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", () => {
      const coordStr = rawData[0].coord.value
      console.log(coordStr)
      const coords = parseMapCoords(coordStr)
      console.log('final map coords: ',coords)
      // Send the formatted data as JSON
      res.json({ success: true, data: coords });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error: ", err);
    res.status(500).send("Internal server error");
  }
})

// API 12 ( new endpoint)
router.post("/amenity-categories", async (req,res) => {
  const cityURI = req.body.cityURI
  try {
    const query = `
      PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX config: <http://ontology.eil.utoronto.ca/CDT_Config/>
      select ?d ?d_label ?colour ?icon where {
          #where t is the input parameter of a city's URI
          <${cityURI}> config:hasDashboardConfig ?x.
          ?x a config:CompleteCommunitiesDashboardConfig.
          ?x config:includesCompleteCommunitiesDimension ?d.
           ?d rdfs:label ?d_label.

          OPTIONAL {?d config:mapColour ?colour}
          
          OPTIONAL {?d config:mapIcon ?icon}
          
      }
    `

    // Execute the query
    const stream = await client2.query.select(query);

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", async () => {
      console.log("amenity-categories API result: ", rawData)
      //add the subtypes to the result before returning a response
      const amenities = transformAmenityCategories(rawData) // {health : {color: '#dfdf', icon: ''}}
      
      await Promise.all(
        Object.keys(amenities).map(async (name) => {
          if (name === 'ParkService') {
            amenities[name].subtypes = ['ParkService']
          } else if (name === 'PublicTransitService') {
            amenities[name].subtypes = ['PublicTransitService']
          } else {
            const subtypes = await getSubtypesByAmenity(name)
            console.log(`subtypes for ${name}: `, subtypes)
            amenities[name].subtypes = subtypes.filter(k => k != name) 
          }
          
        })
      )
      // Send the formatted data as JSON
      res.json({ success: true, data: amenities });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error : ", err);
    res.status(500).send("Internal server error");
  }
  
})

// API 13
router.post('/get-area-amenities', async (req,res) => {
  const area_id = req.body.areaId
  const categoryFilters = req.body.subTypeMap //Map, which we can check in constant time to filter
  console.log('subtype category filters: ', categoryFilters)
  console.log('/get-area-amenities areaURI: ',area_id)
  try {
    const query = `
      PREFIX config: <http://ontology.eil.utoronto.ca/CDT_Config/>
      PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX uom: <http://www.opengis.net/def/uom/OGC/1.0/>
      PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
      PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX hp: <http://ontology.eil.utoronto.ca/HPCDM/>
      PREFIX bdg: <https://standards.iso.org/iso-iec/5087/-2/ed-1/en/ontology/Building/>

      SELECT distinct ?pwkt ?class ?name

      WHERE {
        #for classes defined in the dashboard config
        ?t config:hasDashboardConfig ?config.
          ?config a config:CompleteCommunitiesDashboardConfig.
          ?config config:includesCompleteCommunitiesDimension ?d.
        
          <${area_id}> loc:hasLocation ?nloc.
          # Fetch amenities in neighbourhood
              ?x a ?d.
      ?x a ?class.
          ?class rdfs:subClassOf ?d.
              ?x hp:providedFromSite ?xsite.
              ?xsite cdt:locatedInAdministrativeArea <${area_id}>;#using new property computed in a batch update
                  loc:hasLocation ?ploc.
              ?ploc geo:asWKT ?pwkt.
      # amenity name
              OPTIONAL { ?p cdt:providesService ?x;
                  genprop:hasName ?name}#amenity name
    OPTIONAL {?xsite genprop:hasName ?name}#service site name
      }
    `

    const query2 = `
      PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
      PREFIX org: <http://www.w3.org/ns/org#>
      PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
      PREFIX hp: <http://ontology.eil.utoronto.ca/HPCDM/>

      SELECT ?pwkt ?class ?name
      WHERE {{
          # Get the area's WKT boundary geometry
          <${area_id}> loc:hasLocation ?nloc.
          ?nloc geo:asWKT ?areawkt.           # ← fetch the actual geometry

          {{
              # Branch 1 — CompleteCommunityAmenity
              ?x a cdt:CompleteCommunityAmenity.
              ?x a ?class.
              ?class rdfs:subClassOf cdt:CompleteCommunityAmenity.
              ?p cdt:providesService ?x;
                org:hasSite [ loc:hasLocation ?ploc ].
              ?ploc geo:asWKT ?pwkt.
              OPTIONAL {{?p genprop:hasName ?name}}

              # ← spatial containment filter
              FILTER(geof:sfWithin(?pwkt, ?areawkt))
          }}
          UNION
          {{
              # Branch 2 — Service
              <${area_id}> loc:hasLocation ?nloc2.
              ?nloc2 geo:asWKT ?areawkt2.

              ?x a cdt:Service.
              ?x a ?class.
              ?class rdfs:subClassOf cdt:Service.
              ?x hp:providedFromSite [ loc:hasLocation ?ploc ].
              ?ploc geo:asWKT ?pwkt.

              # ← spatial containment filter
              FILTER(geof:sfWithin(?pwkt, ?areawkt2))
          }}
      }}
    `

    // Execute the query
    const stream = await client2.query.select(sanitizeSparqlQuery(query));

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", async () => {
      // console.log("get-area-amenities API  result: ", rawData.slice(0,1))
      //first pre filter the raw data, by categories matching the subtype categories of the city

      const amenities = transformAreaAmenities(rawData,categoryFilters)
      // console.log('filtered amenities: ', amenities)
      const formattedAmenities = formatAmenities(amenities,categoryFilters)
      
      // Send the formatted data as JSON
      res.json({ success: true, data: formattedAmenities });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error: ", err);
    res.status(500).send("Internal server error");
  }
})

// API 14
router.post('/walkability-scores', async (req,res) => {
  try {
    const areaURI = req.body.areaURI
    const areaId = areaURI.split("#").at(-1)
    const amenityCategories = req.body.amenityCategories
    console.log('/walkability-scores areaURI: ', areaURI)

    const query = `
    PREFIX uom: <http://www.opengis.net/def/uom/OGC/1.0/>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
    PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
    PREFIX hp: <http://ontology.eil.utoronto.ca/HPCDM/>
    PREFIX bdg: <https://standards.iso.org/iso-iec/5087/-2/ed-1/en/ontology/Building/>

    SELECT 
      ?class 
      ?totalBuildingCount
      (COUNT(DISTINCT ?b) AS ?buildingsWithin400mCount)
    WHERE {
      # 1. Compute total buildings ONCE in a fast, isolated subquery
      {
        SELECT (COUNT(DISTINCT ?bTotal) AS ?totalBuildingCount) WHERE {
          tor:${areaId} a tor:Neighborhood .
          ?bTotal a bdg:Building ;
                  bdg:use ?use ;
                  cdt:locatedInAdministrativeArea tor:${areaId} .
        }
      }

          {
        tor:${areaId} a tor:Neighborhood.
        ?b a bdg:Building;
          bdg:use ?use;    #add clause to capture bdg:use residential only
          cdt:locatedInAdministrativeArea tor:${areaId};
          loc:hasLocation ?bloc.
        ?bloc geo:asWKT ?bwkt.
        # Fetch candidate amenities
        ?x a cdt:CompleteCommunityAmenity.
        ?x a ?class.
        ?class rdfs:subClassOf cdt:CompleteCommunityAmenity.    
        # within 400m of some amenity of type x
        FILTER EXISTS {

            ?x hp:providedFromSite [ loc:hasLocation ?ploc ].
            ?ploc geo:asWKT ?pwkt.

            FILTER(geof:distance(?bwkt, ?pwkt, uom:metre) <= 400)
        }
    }
        UNION
        {
            #select DISTINCT ?b where{
        
        tor:${areaId} a tor:Neighborhood.
        ?b a bdg:Building;
          bdg:use ?use;    #add clause to capture bdg:use residential only
          cdt:locatedInAdministrativeArea tor:${areaId};
          loc:hasLocation ?bloc.
        ?bloc geo:asWKT ?bwkt.
        # Fetch candidate amenities
        ?x a cdt:Service.
        ?x a ?class.
        ?class rdfs:subClassOf cdt:Service.    
        # within 400m of some amenity of type x
        FILTER EXISTS {

            ?x hp:providedFromSite [ loc:hasLocation ?ploc ].
            ?ploc geo:asWKT ?pwkt.

            FILTER(geof:distance(?bwkt, ?pwkt, uom:metre) <= 400)
        }
        }
    }
    GROUP BY ?class ?totalBuildingCount`

    // Execute the query
    console.log('executing walkability query')
    const stream = await client2.query.select(sanitizeSparqlQuery(query));

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", async () => {
      console.log("walkability-scores API  result: ", rawData)
      //first pre filter the raw data, by categories matching the subtype categories of the city

      const formattedWalkability = formatWalkability(rawData,amenityCategories)
      
      // Send the formatted data as JSON
      res.json({ success: true, data: formattedWalkability });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });

  } catch (err) {
    console.error("Server error on walkability score: ", err);
    res.status(500).send("Internal server error");
  }

})

// helper
async function getSubtypesByAmenity (amenityCategory) {
  try {
    const query = `
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX config: <http://ontology.eil.utoronto.ca/CDT_Config/>
      PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
      select ?subtype where {
          #where cdt:HealthAmenity is an example of the parameter input - the class that we want to retrieve all leaf subclasses of (including itself if it has no subclasses)
          
          ?subtype rdfs:subClassOf cdt:${amenityCategory}Amenity.

          # Exclude the Nothing class
          FILTER (?subtype != owl:Nothing)
          
          # Ensure ?subtype is a leaf (it must NOT have any strictly narrower subclasses)
          FILTER NOT EXISTS {
              ?child rdfs:subClassOf ?subtype .
              FILTER (?child != ?subtype && ?child != owl:Nothing)
          }
      }
    `

    const query2 = `
    PREFIX owl: <http://www.w3.org/2002/07/owl#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX tor: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
    PREFIX config: <http://ontology.eil.utoronto.ca/CDT_Config/>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT/>
    select ?subtype where {
        #where cdt:HealthAmenity is an example of the parameter input - the class that we want to retrieve all leaf subclasses of (including itself if it has no subclasses)
        
        ?subtype rdfs:subClassOf cdt:${amenityCategory}Amenity.

        # Exclude the Nothing class
        FILTER (?subtype != owl:Nothing)
        
        # Ensure ?subtype is a leaf (it must NOT have any strictly narrower subclasses)
        #FILTER NOT EXISTS {
        #    ?child rdfs:subClassOf ?subtype .
        #    FILTER (?child != ?subtype && ?child != owl:Nothing)
        #}
    }
    `

    // Execute the query
    const stream = await client2.query.select(query2);

    return new Promise((resolve,reject) => {

    // Collect results from the stream
      let rawData = [];
      stream.on("data", (row) => {
        rawData.push(row);
      });

      stream.on("end", () => {
        // console.log("amenity-subtypes API result: ", rawData)
        const subtypes = rawData.map((item) => {
            return item?.subtype?.value.split('/').at(-1).replace('Amenity','')
        })
        // Send the formatted data as JSON
        resolve(subtypes)
      });

      // Handle errors in the query or stream
      stream.on("error", (err) => {
        console.error("Query error: ", err);
        reject(err)
      });

    })
  } catch (err) {
    console.error("Server error: ", err);
    return null
  }
}

// Not used anymore, should remove
router.post("/park-locations", async (req, res) => {
  const neighborhoodName = req.body.neighborhoodName;
  try {
    const query = `
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>
      PREFIX gcir: <http://ontology.eil.utoronto.ca/GCI/Recreation/GCIRecreation.owl#>
      PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
      PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
      PREFIX osm: <http://ontology.eil.utoronto.ca/OSM#>
      PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
      PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

      SELECT ?park ?name ?coordinates

      WHERE{
            ?park a gcir:Park;
        loc:hasLocation ?location.
          
          OPTIONAL { ?park genprop:hasName ?name; }

            ?location geo:asWKT ?coordinates.
            
            toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
            ?neighlocation geo:asWKT ?neighcoordinates.

            FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
      }
    `;

    // Execute the query
    const stream = await client2.query.select(query);

    // Collect results from the stream
    let rawData = [];
    stream.on("data", (row) => {
      rawData.push(row);
    });

    stream.on("end", () => {
      // Transform the raw data into a more readable format
      const formattedData = pointData.map((binding) => {
        return {
          park: binding.park.value,
          name: binding.name ? binding.name.value : null,
          coordinates: binding.coordinates ? binding.coordinates.value : null,
        };
      });

      // Send the formatted data as JSON
      res.json({ success: true, data: formattedData });
    });

    // Handle errors in the query or stream
    stream.on("error", (err) => {
      console.error("Query error: ", err);
      res.status(500).send("Error executing query");
    });
  } catch (err) {
    console.error("Server error: ", err);
    res.status(500).send("Internal server error");
  }
});

// Function to handle the multiple cases for splitting URIs
// Supports both URIs with "#" and those with just "/"
function splitURI(URI) {
  var prefix, suffix;
  if (String(URI).includes("#")) {
    prefix = String(URI).split("#")[0] + "#";
    suffix = String(URI).split("#")[1];
  } else {
    prefix = String(URI).substring(0, String(URI).lastIndexOf("/") + 1);
    suffix = String(URI).substring(String(URI).lastIndexOf("/"));

    // Remove illegal characters (currently / and #) from the suffix, as they break SPARQL queries
    suffix = suffix.replace(/[\/#]/g, "");
  }

  return [prefix, suffix];
}

function isURI(URI) {
  URI = String(URI);

  const hasHTTP = URI.includes("http");
  const hasHashtag = URI.includes("#");
  const hasSlash = URI.includes("/");

  return hasHTTP && (hasHashtag || hasSlash);
}

function includesAllInputs(requiredInputs, inputType) {
  if (!Array.isArray(requiredInputs) || typeof inputType !== "string") {
    return null;
  }

  for (let input in requiredInputs) {
    if (!requiredInputs[input] || typeof requiredInputs[input] !== inputType) {
      return false;
    }
  }
  return true;
}



module.exports = router;
