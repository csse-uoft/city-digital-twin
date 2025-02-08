var express = require('express');
var router = express.Router();

var SparqlClient = require('sparql-http-client');
require('dotenv').config();

const endpointUrl = process.env.ENDPOINT_URL;

const client = new SparqlClient({ endpointUrl });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// returns all cities in the knowledge graph
router.get("/cities", async (req, res) => {
  const query = `
    PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    select ?city where {
      ?city rdf:type i50872:City.
    }
  `;

  const stream = await client.query.select(query);

  var result = [];
  var totalResults = 0;
  
  stream.on('data', row => {
    Object.entries(row).forEach(([key, value]) => {
      result.push(value.value);
      totalResults++;
    });
  });

  stream.on('end', () => {
    res.json({message: "success", cityNames: result, totalResults: totalResults});
  });
  
  stream.on('error', err => {
    res.status(500).send('Oops, error!');
  });
});


//returns all indicators in the knowledge graph
router.get("/indicators", async (req, res) => {
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

  const stream = await client.query.select(query);

  var result = [];
  var totalResults = 0;

  stream.on('data', row => {
    // Version for simply putting each result value into the final array
    Object.entries(row).forEach(([key, value]) => {
      result.push(value.value);
      totalResults++;
    });
  });

  stream.on('end', () => {
    res.json({message: "success", indicatorNames: result, totalResults: totalResults});
  });
  
  stream.on('error', err => {
    res.status(500).send('Oops, error!');
  });
});


// Input form: {cityName: "http://ontology.eil.utoronto.ca/5087/2/City#Toronto"}
// Output: JSON list of all administrative area types
// Description: Get all administrative area types (ward, neighbourhood, etc.) for a given city
router.post("/admin-types", async (req, res) => {
  if (!includesAllInputs([req.body.cityName], "string")) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
  } else if (!isURI(req.body.cityName)) {
    res.status(400);
    res.json({message:"Bad request: cityName is not an URI"});
  } else {
    const [prefix, suffix] = splitURI(req.body.cityName);

    const query = `
      PREFIX CITY: <${prefix}>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT DISTINCT ?AdminAreaType WHERE {
          CITY:${suffix} ?p ?AdminArea.
          ?AdminArea rdf:type ?AdminAreaType.
          ?AdminAreaType rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `;

    // Check if city is in database; if not, quit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${suffix} rdf:type i50872:City.
      }
    `);

    if (!doesCityExist) {
      res.status(400);
      res.json({message:"Bad request: Provided city does not exist"});
    } else {
      const stream = await client.query.select(query);

      var result = [];

      stream.on('data', row => {
        // Version for simply putting each result value into the final array
        Object.entries(row).forEach(([key, value]) => {
          result.push(value.value);
        });
      });
    
      stream.on('end', () => {
        res.json({message: "success", adminAreaTypeNames: result});
      });
      
      stream.on('error', err => {
        res.status(500).send('Oops, error!');
      });
    }
  }
});


// Input: Name of city (cityName), name of administrative area type (adminType)
// Output: List of all admin area instances for the given type and city
router.post("/admin-instances", async (req, res) => {
  if (!includesAllInputs([req.body.cityName, req.body.adminType], "string")) {
    res.status(400);
    res.json({message:"Bad request: missing or non-string cityName or adminType"});
  } else if (!isURI(req.body.cityName) || !isURI(req.body.adminType)) {
    res.status(400);
    res.json({message:"Bad request: cityName or adminType is not an URI"}); 
  } else {
    const [prefix, citySuffix] = splitURI(req.body.cityName);
    const [,adminTypeSuffix] = splitURI(req.body.adminType);

    const query = `
      PREFIX CITY: <${prefix}>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      SELECT DISTINCT ?adminAreaInstance ?areaName  WHERE {
        CITY:${citySuffix} ?p ?adminAreaInstance.
        ?adminAreaInstance rdfs:comment ?areaName.
        ?adminAreaInstance rdf:type CITY:${adminTypeSuffix}.
      }
    `;

    // Check if city is in database; if not, quit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      ASK {
          CITY:${citySuffix} ?p ?AdminArea.
          ?AdminArea rdf:type CITY:${adminTypeSuffix}.
          CITY:${adminTypeSuffix} rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `);

    if (!doesCityExist || !doesAdminAreaTypeExist) {
      if (!doesCityExist) {
        res.status(400);
        res.json({message:"Bad request: Provided city does not exist"});
      } else {
        res.status(400);
        res.json({message:"Bad request: Provided administrative area type does not exist"});
      } 
    } else {
      const stream = await client.query.select(query);

      var result = [];
      var totalResults = 0;

      stream.on('data', row => {
        var singleRow = {};
        Object.entries(row).forEach(([key, value]) => {
          singleRow[key] = value.value;
        });
        result.push(singleRow);
        totalResults++;
      });
    
      stream.on('end', () => {
        res.json({message: "success", adminAreaInstanceNames: result, totalResults:totalResults});
      });
      
      stream.on('error', err => {
        res.status(500).send('Oops, error!');
      });
    }
  }
});


// Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance), indicators (indicatorNames), time range (timeStart, timeEnd)
// Output: Corresponding visualization and indicator data from connected database
router.post("/visualization-data", async (req, res) => {
  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!req.body.cityName) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
    return;
  } else if (!req.body.adminType) {
    res.status(400);
    res.json({message:"Bad request: missing adminType"});
    return;
  } else if (!req.body.adminInstance || !Array.isArray(req.body.adminInstance)) {
    res.status(400);
    res.json({message:"Bad request: missing or non-array adminInstance"});
    return;
  } else if (!req.body.indicatorName) {
    res.status(400);
    res.json({message:"Bad request: missing indicatorName"});
    return;
  } else if (!req.body.startTime || !req.body.endTime) {
    res.status(400);
    res.json({message:"Bad request: missing date"});
    return;
  // ----------- ALL REQUEST VARIABLES PROVIDED ----------
  } else {

    const cityPrefix = String(req.body.cityName).split("#")[0];
    const citySuffix = String(req.body.cityName).split("#")[1];
    
    const adminTypeSuffix = String(req.body.adminType).split("#")[1];

    const indicatorPrefix = String(req.body.indicatorName).split("#")[0];
    const indicatorSuffix = String(req.body.indicatorName).split("#")[1].slice(0, -4);

    const startTime = parseInt(req.body.startTime);
    const endTime = parseInt(req.body.endTime);

    const adminInstanceSuffix = Array.isArray(req.body.adminInstance) ? req.body.adminInstance.map(instance => {
      return String(instance).split("#")[1];
    }) : String(req.body.adminInstance).split("#")[1];

    console.log(adminInstanceSuffix)
    var finalResult = {};

    // Check if provided city exists; if not, exit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${cityPrefix}#>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    if (!doesCityExist) {
      res.status(400);
      res.json({message:"Bad request: Provided city does not exist"});
      return;
    }

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client.query.ask(`
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
      res.json({message:"Bad request: Provided administrative area type does not exist"});
      return;
    }

    var adminAreaTypeNames = [];
    
    // Get list of admin area type names
    const adminAreaTypeNameStream =  await client.query.select(`
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
    adminAreaTypeNameStream.on('data', row => {
      Object.entries(row).forEach(([key, value]) => {
        if (String(value.value).split("#")[1] !== adminTypeSuffix) {
          adminAreaTypeNames.push(String(value.value).split("#")[1]);
        }
      });
    });

    adminAreaTypeNameStream.on('end', async () => {
      for (let instance in adminInstanceSuffix) {
        var instanceResult = {};
        for (let year = startTime; year <= endTime + 1; year++) {
          
          const indicatorSuffixWithYear = indicatorSuffix + String(year);

          // Determine if each indicator exist for given admin Type
          var notSameAdminType = "";
          var isIndicatorAdminTypeSame = null;            
          var countIsIndicatorAdminTypeSame = 0;

          while (countIsIndicatorAdminTypeSame < 3){
            try{
              await sleep(200); // Sleep for 0.2 seconds
              isIndicatorAdminTypeSame = await client.query.ask(`
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
            }catch (err) {
              console.log("isIndicatorAdminTypeSame error: ", err)
            }
          }

          if (!isIndicatorAdminTypeSame) {
            // Find the area type with matching data
            for (let adminArea in adminAreaTypeNames) {
              var isAdminTypeMatching;
              var count = 0;
              var success = false;
              var error = ""
              while (count < 3){
                try {
                  await sleep(200); // Sleep for 0.2 seconds
                  isAdminTypeMatching = await client.query.ask(`
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
                  error = err
                  console.log("!~~~~~~~ Error executing SPARQL query, retry now, error: ", err)
                }

                if (success){
                  break;
                }
              }

              if (!success) {
                // Handle and log the error
                console.error('Error executing SPARQL query:', error);
                res.status(500).json({ message: 'Oops, something went wrong!' , err: error });
                return;
              }

              if (isAdminTypeMatching) {
                // console.log("adminTypeSuffix", adminTypeSuffix)
                // console.log("indicatorSuffixWithYear", indicatorSuffixWithYear)
                // console.log("adminAreaTypeNames", adminAreaTypeNames)
                // console.log("adminAreaTypeNames[adminArea]", adminAreaTypeNames[adminArea])

                // console.log("here to problem used to begin")
                // console.log("---------------------")
                notSameAdminType = adminArea;

                // Also determine which of the new admin areas overlap with the old area, if an adminInstance was provided
                // If data is only available at a LARGER admin area, return an error (no way to split it down)
                var overlappingAreaList = [];
                
                const overlappingAdminAreas = await client.query.select(`
                  PREFIX CITY: <${cityPrefix}#>
                  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                  PREFIX iso5087m: <http://ontology.eil.utoronto.ca/5087/1/Mereology/>
                  
                  SELECT ?overlappingArea WHERE {
                      CITY:${adminInstanceSuffix[instance]} iso5087m:hasProperPart ?overlappingArea.
                      ?overlappingArea rdf:type CITY:${adminAreaTypeNames[adminArea]}.
                  }
                `);
                                
                overlappingAdminAreas.on('data', row => {
                  Object.entries(row).forEach(([key, value]) => {
                    overlappingAreaList.push(String(value.value).split("#")[1]);
                  });
                });

                overlappingAdminAreas.on('end', async () => {
                  // console.log("overlappingAreaList", overlappingAreaList)

                  var result = 0;
                  if (overlappingAreaList.length === 0) {
                    try {
                      // res.status(500); // COMMENTED OUT BECAUSE OTHERWISE IT CRASHES WHEN DOING CENSUS TRACTS
                      // res.json({message:"Bad request: No indicator data for given admin area type or smaller"});
                      return;
                    } catch (error) {
                      console.error('Error executing SPARQL query:', error);
                      res.status(500).json({ message: 'Oops, something went wrong! (census tract crutch triggered)', err: error });
                      return;
                    }
                  } else {
                    // // too long, need to slice
                    // var indicatorDataQuery = `
                    //   PREFIX CITY: <${cityPrefix}#>
                    //   PREFIX INDICATOR: <${indicatorPrefix}#>
                    //   PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

                    //   SELECT ?value WHERE { 
                    // `;

                    // overlappingAreaList.forEach((overlappingArea, index) => {
                    //   if (index !== 0) indicatorDataQuery += `
                    //     UNION
                    //   `;

                    //   indicatorDataQuery += `
                    //     {INDICATOR:${overlappingArea}${indicatorSuffixWithYear} iso21972:value ?measure.
                    //     ?measure iso21972:numerical_value ?value.}
                    //   `;
                    // });

                    // indicatorDataQuery += "}";
                    // console.log(indicatorDataQuery)
                    // // Removes newline characters
                    // indicatorDataQuery = indicatorDataQuery.replace(/(\r\n|\n|\r)/gm, "");
                    
                    // console.log("Root cause of this bug")
                    // try{
                    //   // line below caused bug
                    //   const getValuesForOverlappingAreas = await client.query.select(indicatorDataQuery);
                    //   console.log("here")
                    //   var hasData = false;

                    //   getValuesForOverlappingAreas.on('data', row => {
                    //     Object.entries(row).forEach(([key, value]) => {
                    //       hasData = true;
                    //       temp = parseInt(value.value);

                    //       // Only add new value to result if it's a number, else return an error
                    //       if (!Number.isNaN(temp)) {
                    //         result += temp;
                    //       } else {
                    //         if (year <= endTime) {
                    //           instanceResult[year] = NaN;
                    //         }
                    //       }
                    //     });
                    //   });
              
                    //   getValuesForOverlappingAreas.on('end', () => {
                    //     if (!hasData) {
                    //       if (year <= endTime) {
                    //         instanceResult[year] = NaN;
                    //       }
                    //     } else {
                    //       if (year <= endTime) {
                    //         instanceResult[year] = result;
                    //       }
                    //     }
                    //   });

                    //   getValuesForOverlappingAreas.on('error', err => {
                    //     res.status(500).send('Oops, error!');
                    //     return;
                    //   });
                    // }catch(error){
                    //   res.status(500); 
                    //   // res.json({message:"Bad request: Returned too large"}); // COMMENTED OUT BECAUSE OTHERWISE IT CRASHES WHEN DOING WARD, PoliceDivision, Neighbourhood
                    //   console.log("const getValuesForOverlappingAreas = await client.query.select(indicatorDataQuery); cause the error")
                    //   return
                    // }

                    // Function to process batches
                    
                    async function processBatch(batch) {
                      // console.log(batch)
                      return new Promise(async (resolve, reject) => {
                        let batchQuery = `
                          PREFIX CITY: <${cityPrefix}#>
                          PREFIX INDICATOR: <${indicatorPrefix}#>
                          PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>
                    
                          SELECT ?value WHERE { 
                        `;
                    
                        batch.forEach((overlappingArea, index) => {
                          if (index !== 0) batchQuery += `
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
                          const batchResult = await client.query.select(batchQuery);
                          let batchTotal = 0;
                          let hasData = false;
                    
                          batchResult.on('data', (row) => {
                            hasData = true;
                            const temp = parseInt(row.value.value);
                    
                            if (!Number.isNaN(temp)) {
                              batchTotal += temp;
                            }
                          });
                    
                          batchResult.on('end', () => {
                            resolve({ hasData, batchTotal });
                          });
                    
                          batchResult.on('error', (err) => {
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
                      for (let i = 0; i < overlappingAreaList.length; i += batchSize) {
                        batches.push(overlappingAreaList.slice(i, i + batchSize));
                      }
                    
                      // Process each batch sequentially
                      for (const batch of batches) {
                        const { hasData, batchTotal } = await processBatch(batch);
                        // console.log("hasData, batchTotal")
                        // console.log(hasData, batchTotal)
                    
                        if (hasData) {
                          result += batchTotal;
                        }
                      }
                      if (year <= endTime) {
                        instanceResult[year] = result || 0; // Assign NaN if no data
                        // console.log("instanceResult, year")
                        // console.log(instanceResult, instanceResult[year])
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
            
            indicatorDataStream = await client.query.select(`
              PREFIX CITY: <${cityPrefix}#>
              PREFIX INDICATOR: <${indicatorPrefix}#>
              PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

              SELECT ?value WHERE {
                INDICATOR:${adminInstanceSuffix[instance]}${indicatorSuffixWithYear} iso21972:value ?measure.
                ?measure iso21972:numerical_value ?value.
              }
            `);

            var hasData = false;

            indicatorDataStream.on('data', row => {
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

            indicatorDataStream.on('end', () => {
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

            indicatorDataStream.on('error', err => {
              res.status(500).send('Oops, error!');
              return;
            });
          }
        }
        finalResult[[`${cityPrefix}#${adminInstanceSuffix[instance]}`]] = instanceResult;
      }
      res.json({message:"success", indicatorDataValues:finalResult});
    });

    adminAreaTypeNameStream.on('error', err => {
      // res.status(500).send('Oops, error!');
      return;
    });
  }
});


// API 5
// Select a property (or all matching properties) for a given subject
// 
router.post("/5", async (req, res) => {
  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!includesAllInputs([req.body.predicate, req.body.subject], "string")) {
    res.status(400);
    res.json({message:"Bad request: missing required input(s) (cityName, predicate, or subject)"});
  } else if (!isURI(req.body.predicate) || !isURI(req.body.subject)) {
    res.status(400);
    res.json({message:"Bad request: predicate or subject is not an URI"}); 
  } else {
    const [predicatePrefix, predicateSuffix] = splitURI(req.body.predicate);
    const [subjectPrefix, subjectSuffix] = splitURI(req.body.subject);

    const stream = await client.query.select(`
      PREFIX FINDFROM: <${subjectPrefix}>
      PREFIX PROPERTY: <${predicatePrefix}>

      SELECT ?propertyValue WHERE {
        FINDFROM:${subjectSuffix} PROPERTY:${predicateSuffix} ?propertyValue.
      }
    `);

    var result = [];
    var totalResults = 0;

    stream.on('data', row => {
      // Version for simply putting each result value into the final array
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
        totalResults++;
      });
    });
  
    stream.on('end', () => {
      res.json({message: "success", propertyValue: result, totalResults:totalResults});
    });
    
    stream.on('error', err => {
      res.status(500).send('Oops, error!', err);
    });
  }
});


// API 6
// Return all the geoWKT location data.
router.post("/6", async (req, res) => {
  if (!includesAllInputs([req.body.cityName, req.body.adminType], "string")) {
    res.status(400);
    res.json({message:"Bad request: missing or non-string cityName or adminType"});
  } else if (!isURI(req.body.cityName) || !isURI(req.body.adminType)) {
    res.status(400);
    res.json({message:"Bad request: cityName or adminType is not an URI"}); 
  } else {
    const [prefix, citySuffix] = splitURI(req.body.cityName);
    const [,adminTypeSuffix] = splitURI(req.body.adminType);

    const query = `
      PREFIX CITY: <${prefix}>
      PREFIX iso50872City: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX iso50871Loc: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX geo: <http://www.opengis.net/ont/geosparql#>

      SELECT DISTINCT ?adminAreaInstance ?areaLocation WHERE {
        CITY:${citySuffix} ?p ?adminAreaInstance.
        ?adminAreaInstance rdfs:comment ?areaName.
        ?adminAreaInstance rdf:type CITY:${adminTypeSuffix}.
        ?adminAreaInstance iso50871Loc:hasLocation ?loc.
        ?loc geo:asWKT ?areaLocation.
      }
    `;

    // Check if city is in database; if not, quit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${citySuffix} rdf:type i50872:City.
      }
    `);

    // Check if provided admin area type exists; if not, exit
    const doesAdminAreaTypeExist = await client.query.ask(`
      PREFIX CITY: <${prefix}>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      ASK {
          CITY:${citySuffix} ?p ?AdminArea.
          ?AdminArea rdf:type CITY:${adminTypeSuffix}.
          CITY:${adminTypeSuffix} rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `);

    if (!doesCityExist || !doesAdminAreaTypeExist) {
      if (!doesCityExist) {
        res.status(400);
        res.json({message:"Bad request: Provided city does not exist"});
      } else {
        res.status(400);
        res.json({message:"Bad request: Provided administrative area type does not exist"});
      } 
    } else {
      const stream = await client.query.select(query);

      var result = [];
      var totalResults = 0;

      stream.on('data', row => {
        var singleRow = {};
        Object.entries(row).forEach(([key, value]) => {
          singleRow[key] = value.value;
        });
        result.push(singleRow);
        totalResults++;
      });
    
      stream.on('end', () => {
        res.json({message: "success", adminAreaInstanceNames: result, totalResults:totalResults});
      });
      
      stream.on('error', err => {
        res.status(500).send('Oops, error!');
      });
    }
  }
});


// Returns metrics describing how easily a park is accessible by all neighbourhoods
router.post("/park-data", async (req, res) => {
  
  try {
    const query = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
      PREFIX osm: <http://ontology.eil.utoronto.ca/OSM#>
      PREFIX uoft: <http://ontology.eil.utoronto.ca/tove/cacensus#>
      PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

      SELECT ?name ?value
      WHERE {
        ?neighborhood a toronto:Neighborhood;
          rdfs:comment ?name.

        ?parkindicator a osm:PercentWalkingDistance400Park;
          uoft:hasLocation ?neighborhood;
          iso21972:value ?measure.

        ?measure iso21972:numerical_value ?value.
      }
    `;

    // Execute the query
    const stream = await client.query.select(query);

    // Collect results from the stream
    const results = [];
    stream.on('data', row => {
      results.push({
        name: row.name.value,
        value: row.value.value,
      });
    });

    // Handle stream end (when all data has been processed)
    stream.on('end', () => {
      res.json(results); // Send the collected results as JSON response
    });

    // Handle errors in the query or stream
    stream.on('error', err => {
      console.error('Query error: ', err);
      res.status(500).send('Error executing query');
    });

  } catch (err) {
    console.error('Server error: ', err);
    res.status(500).send('Internal server error');
  }
});


router.get("/all-amenity-URLs", async (req, res) =>{
  const amenityClassesQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>

    SELECT ?amenity
    WHERE {
        ?amenity rdfs:subClassOf cdt:CompleteCommunityAmenity.
    }
  `;

  const amenityInstancesQuery = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>

    SELECT ?amenityinstance
    WHERE {
        ?amenityinstance a cdt:CompleteCommunityAmenity.
    }
  `;

  try {
    // Execute the first query for amenity classes
    const stream = await client.query.select(amenityClassesQuery);

    // Collect results from the stream
    let rawData = [];
    stream.on('data', (row) => {
      rawData.push(row.amenity.value); // Collect each result row
    });

    stream.on('end', () => {
      // Format the data
      // Send the formatted data as JSON response
      res.json({ success: true, urls: rawData });
    });

    stream.on('error', (err) => {
      console.error('Query error: ', err);
      res.status(500).send('Error executing query');
    });
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).send('An error occurred while executing the query');
  }

});


// router.post("/amenity-location-seq", async (req, res) => {
//   const neighborhoodName = req.body.neighborhoodName;
//   const amenityURL = req.body.amenityURL;

//   console.log(req.body)
  
//   GCIRecreationURL = 'http://ontology.eil.utoronto.ca/GCI/Recreation/GCIRecreation.owl'
//   GCIEducationURL = 'http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl'
//   CDTURL = 'http://ontology.eil.utoronto.ca/CDT'
//   Hospital = 'http://schema.org/Hospital'
//   GCIHealthURL = 'http://ontology.eil.utoronto.ca/CDT'

//   var amenityQuery = '';

//   var amenitydName = '';

//   if (amenityURL.includes(GCIRecreationURL)){
//     console.log("GCIRecreationURL");
//     amenitydName = amenityURL.split('#')[1];
//     amenityQuery = `
//         PREFIX geo: <http://www.opengis.net/ont/geosparql#>
//         PREFIX gcir: <http://ontology.eil.utoronto.ca/GCI/Recreation/GCIRecreation.owl#>
//         PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
//         PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
//         PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
//         PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
//         PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
    
//         SELECT ?${amenitydName} ?name ?coordinates
    
//         WHERE{
//             ?${amenitydName} a gcir:${amenitydName};
//             loc:hasLocation ?location.
//             ?location geo:asWKT ?coordinates.
//             OPTIONAL { ?${amenitydName} genprop:hasName ?name; }
            
//             toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
//             ?neighlocation geo:asWKT ?neighcoordinates.
    
//             FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
//         }
//     `;
//   } else if (amenityURL.includes(GCIEducationURL)){
//     console.log("GCIEducationURL")
//     amenitydName = amenityURL.split('#')[1]
//     amenityQuery = `
//         PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
//         PREFIX geo: <http://www.opengis.net/ont/geosparql#>
//         PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
//         PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
//         PREFIX gcie: <http://ontology.eil.utoronto.ca/GCI/Education/GCI-Education.owl#>
//         PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

//         SELECT ?amenity ?id ?name ?coordinates

//         WHERE {
//           ?amenity a gcie:${amenitydName};
//           cdt:osmID ?id;
//           loc:hasLocation ?location.
//           OPTIONAL { ?${amenitydName} genprop:hasName ?name; }

//           ?location geo:asWKT ?coordinates.
//           toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
//           ?neighlocation geo:asWKT ?neighcoordinates.
//           FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
//         }
//     `;
//   } else if (amenityURL.includes(CDTURL)){
//     console.log("CDTURL")
//     amenitydName = amenityURL.split('#')[1]
//     amenityQuery = `
//         PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
//         PREFIX geo: <http://www.opengis.net/ont/geosparql#>
//         PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
//         PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
//         PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
//         PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
//         PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

//         SELECT ?amenity ?id ?name ?coordinates
        
//         WHERE {
//         ?amenity a cdt:${amenitydName};
//                 cdt:osmID ?id;
//                 loc:hasLocation ?location.
//                 OPTIONAL { ?${amenitydName} genprop:hasName ?name; }

//         ?location geo:asWKT ?coordinates.
//         toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
//         ?neighlocation geo:asWKT ?neighcoordinates.
//         FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
//         }
//     `;
//     console.log("query in cdl:", amenityQuery)
//   } else if (amenityURL.includes(Hospital)){
//     console.log("Hospital")
//     amenityQuery = `
//         PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
//         PREFIX geo: <http://www.opengis.net/ont/geosparql#>
//         PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
//         PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
//         PREFIX sc: <http://schema.org/>
//         PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

//         SELECT ?amenity ?id ?name ?coordinates

//         WHERE {
//           ?amenity a sc:Hospital;
//           cdt:osmID ?id;
//           loc:hasLocation ?location.
//           OPTIONAL {?amenity genprop:hasName ?name}

//           ?location geo:asWKT ?coordinates.
//           toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
//           ?neighlocation geo:asWKT ?neighcoordinates.
//           FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
//         }
//     `;
//   } else if (amenityURL.includes(GCIHealthURL)){
//     console.log("GCIHealthURL")
//     amenitydName = amenityURL.split('#')[1]
//     amenityQuery = `
//         PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
//         PREFIX geo: <http://www.opengis.net/ont/geosparql#>
//         PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
//         PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
//         PREFIX gcih: <http://ontology.eil.utoronto.ca/GCI/Health/GCI-Health.owl#>
//         PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

//         SELECT ?amenity ?id ?name ?coordinates

//         WHERE {
//           ?amenity a gcih:${amenitydName};
//           cdt:osmID ?id;
//           loc:hasLocation ?location.
//           OPTIONAL { ?${amenitydName} genprop:hasName ?name; }

//           ?location geo:asWKT ?coordinates.
//           toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
//           ?neighlocation geo:asWKT ?neighcoordinates.
//           FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
//         }
//     `;
//   }

//   console.log("--->query before:", amenityQuery)
//   console.log("--->amenitydName before:", amenitydName)

//   if (amenityQuery == ''){
//       res.json({
//           success: false,
//           data: null,
//           msg: "no mathing url"
//         });
//   }else{
//     console.log("--->query else:", amenityQuery)
//     console.log("--->amenitydName else:", amenitydName)
//       try{
//           const stream = await client.query.select(amenityQuery);

//           // Collect results from the stream
//           let rawData = [];
//           stream.on('data', (row) => {
              
//               console.log(row)

//             rawData.push(row);
//           });
      
//           stream.on('end', () => {
//             // Transform the raw data into a more readable format
//             const formattedData = rawData.map(binding => {
//               return {
//                 amenity: binding.amenity.value,
//                 name: binding.name ? binding.name.value : null,
//                 coordinates: binding.coordinates ? binding.coordinates.value : null
//               };
//             });
            
//             // Send the formatted data as JSON
//             res.json({ success: true, data: formattedData });
//           });
      
//           // Handle errors in the query or stream
//           stream.on('error', err => {
//             console.error('Query error: ', err);
//             res.status(500).send('Error executing query');
//           });
          
//       }catch (err) {
//           console.error('Server error: ', err);
//           res.status(500).send('Internal server error');
//       }
//   }


// });


router.post("/amenity-location-all", async (req, res) => {
  const neighborhoodName = req.body.neighborhoodName;

  const query = `
    PREFIX loc: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/SpatialLoc/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX genprop: <https://standards.iso.org/iso-iec/5087/-1/ed-1/en/ontology/GenericProperties/>
    PREFIX cdt: <http://ontology.eil.utoronto.ca/CDT#>
    PREFIX toronto: <http://ontology.eil.utoronto.ca/Toronto/Toronto#>
    PREFIX iso50871: <http://ontology.eil.utoronto.ca/5087/1/SpatialLoc/>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

    SELECT ?type ?amenity ?id ?name ?coordinates

    WHERE {
    ?amenity a cdt:CompleteCommunityAmenity;
    cdt:osmID ?id;
    loc:hasLocation ?location.

    GRAPH <http://www.ontotext.com/explicit> {  
    ?amenity a ?type;
    }    

    OPTIONAL {?amenity genprop:hasName ?name}

    ?location geo:asWKT ?coordinates.
              toronto:${neighborhoodName} iso50871:hasLocation ?neighlocation.
              ?neighlocation geo:asWKT ?neighcoordinates.
              FILTER(geof:sfIntersects(?coordinates, ?neighcoordinates))
    }
  `
  try {
    // Execute the first query for amenity classes
    const stream = await client.query.select(query);

    // Collect results from the stream
    let rawData = [];
    stream.on('data', (row) => {
      rawData.push(row);
    });

    stream.on('end', () => {
      // Transform the raw data into a more readable format
      const formattedData = rawData.map(binding => {
        var tp = ''
        if (binding.amenity){
          const url = binding.amenity.value
          const match = url.match(/#\d+([A-Za-z]+)$/);
          if (match) {
            tp = match[1]
          }
        }

        return {
          amenity: binding.amenity? binding.amenity.value : null,
          type: binding.type ? binding.type.value : null,
          decode_type: tp,
          name: binding.name ? binding.name.value : null,
          coordinates: binding.coordinates ? binding.coordinates.value : null
        };
      });
      
      // Send the formatted data as JSON
      res.json({ success: true, data: formattedData });
    });

    stream.on('error', (err) => {
      console.error('Query error: ', err);
      res.status(500).send('Error executing query');
    });

  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).send('An error occurred while executing the query');
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