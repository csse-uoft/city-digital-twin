var express = require('express');
var router = express.Router();

var SparqlClient = require('sparql-http-client');
const endpointUrl = 'http://ec2-3-97-59-180.ca-central-1.compute.amazonaws.com:7200/repositories/CACensus';

const client = new SparqlClient({ endpointUrl });

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
    
    SELECT ?class
    WHERE {
        ?class rdfs:subClassOf iso21972:Indicator.
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

// API 2
// Type: POST
// URL: /api/2/
// Input: Name of city (cityName)
// Input form: {cityName: "City Name"}
// Output: JSON list of all administrative area types
// Description: Get all administrative area types (ward, neighbourhood, etc.) for a given city
router.post("/2", async (req, res) => {
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

// API 3
// Type: POST
// URL: /api/3/
// Input: Name of city (cityName), name of administrative area type (adminType)
// Output: List of all admin area instances for the given type and city
router.post("/3", async (req, res) => {
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

// API 4
// Type: POST
// URL: /api/4/
// Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance), indicators (indicatorNames), time range (timeStart, timeEnd)
// Output: Corresponding visualization and indicator data from connected database
router.post("/4", async (req, res) => {
  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!req.body.cityName) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
  } else if (!req.body.adminType) {
    res.status(400);
    res.json({message:"Bad request: missing adminType"});
  } else if (!req.body.adminInstance || !Array.isArray(req.body.adminInstance)) {
    res.status(400);
    res.json({message:"Bad request: missing or non-array adminInstance"});
  } else if (!req.body.indicatorName) {
    res.status(400);
    res.json({message:"Bad request: missing indicatorName"});
  } else if (!req.body.startTime || !req.body.endTime) {
    res.status(400);
    res.json({message:"Bad request: missing date"});
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

          const isIndicatorAdminTypeSame = await client.query.ask(`
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

          if (!isIndicatorAdminTypeSame) {
            // Find the area type with matching data
            for (let adminArea in adminAreaTypeNames) {
              var isAdminTypeMatching;
              try {
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
              } catch (err) {
                // Handle and log the error
                console.error('Error executing SPARQL query:', error);
                res.status(500).json({ message: 'Oops, something went wrong!' , err: error });
              }


              if (isAdminTypeMatching) {
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
                  var result = 0;
                  if (overlappingAreaList.length === 0) {
                    res.status(500);
                    res.json({message:"Bad request: No indicator data for given admin area type or smaller"});
                  } else {
                    var result = 0;

                    var indicatorDataQuery = `
                      PREFIX CITY: <${cityPrefix}#>
                      PREFIX INDICATOR: <${indicatorPrefix}#>
                      PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

                      SELECT ?value WHERE { 
                    `;

                    overlappingAreaList.forEach((overlappingArea, index) => {
                      if (index !== 0) indicatorDataQuery += `
                        UNION
                      `;

                      indicatorDataQuery += `
                        {INDICATOR:${overlappingArea}${indicatorSuffixWithYear} iso21972:value ?measure.
                        ?measure iso21972:numerical_value ?value.}
                      `;
                    });

                    indicatorDataQuery += "}";

                    // Removes newline characters
                    indicatorDataQuery = indicatorDataQuery.replace(/(\r\n|\n|\r)/gm, "");

                    const getValuesForOverlappingAreas = await client.query.select(indicatorDataQuery);

                    var hasData = false;

                    getValuesForOverlappingAreas.on('data', row => {
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
            
                    getValuesForOverlappingAreas.on('end', () => {
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

                    getValuesForOverlappingAreas.on('error', err => {
                      res.status(500).send('Oops, error!');
                    });
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
            });
          }
        }
        finalResult[[`${cityPrefix}#${adminInstanceSuffix[instance]}`]] = instanceResult;
      }
      res.json({message:"success", indicatorDataValues:finalResult});
    });

    adminAreaTypeNameStream.on('error', err => {
      res.status(500).send('Oops, error!');
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
      res.status(500).send('Oops, error!');
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