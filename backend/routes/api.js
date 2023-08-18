// Define globalThis if it's not available
if (typeof globalThis === 'undefined') {
  if (typeof global !== 'undefined') {
    globalThis = global;
  } else if (typeof self !== 'undefined') {
    globalThis = self;
  } else {
    // In some environments, you might need to use a different fallback
    // For example, in a web browser, you can use window
    // globalThis = window;
  }
}

var express = require('express');
var router = express.Router();

var SparqlClient = require('sparql-http-client');
const endpointUrl = 'http://ec2-3-97-59-180.ca-central-1.compute.amazonaws.com:7200/repositories/CACensus';

/// API 0
// Type: GET
// URL: /api/0/
// Input: None
// Output: List of available cities in connected database
// Description: Get list of available cities
router.get("/0", async (req, res) => {
  const query = `
    PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    
    select ?city where {
      ?city rdf:type i50872:City.
    }
  `;

  const client = new SparqlClient({ endpointUrl });
  const stream = await client.query.select(query);

  var result = [];
  
  stream.on('data', row => {
    // Version for putting each result triple in its own array (easier parsing later)
    // Don't use for API 0, since we don't have triples here
    // var singleRow = [];
    // Object.entries(row).forEach(([key, value]) => {
    //   singleRow.push(value.value);
    // });
    // result.push(singleRow);

    // Version for simply putting each result value into the final array
    // Use for API 0
    Object.entries(row).forEach(([key, value]) => {
      result.push(value.value);
    });
  });

  stream.on('end', () => {
    res.json({message: "success", cityNames: result});
  });
  
  stream.on('error', err => {
    res.status(500).send('Oops, error!');
  });
});

// API 1
// Type: POST
// URL: /api/1/
// Input: Name of city (cityName), provided as the FULL cityName URL from API 0 (e.g. for Toronto, http://ontology.eil.utoronto.ca/Toronto/Toronto#toronto)
// Input form: {cityName: “City Name”}
// Output: List of all indicators in JSON format

// CURRENT ISSUES
// - Does not take into account city input at all, just gets list of ALL indicators from database, whether they're from chosen city or not
router.post("/1", async (req, res) => {
  if (!req.body.cityName) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
  } else {
    const query = `
      PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#> 
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT ?class
      WHERE {
          ?class rdfs:subClassOf iso21972:Indicator.
      }
    `;

    const client = new SparqlClient({ endpointUrl });
    const stream = await client.query.select(query);

    var result = [];

    stream.on('data', row => {
      // Version for simply putting each result value into the final array
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
      });
    });
  
    stream.on('end', () => {
      res.json({message: "success", indicatorNames: result});
    });
    
    stream.on('error', err => {
      res.status(500).send('Oops, error!');
    });
  }
});

// API 2
// Type: POST
// URL: /api/2/
// Input: Name of city (cityName)
// Input form: {cityName: "City Name"}
// Output: JSON list of all administrative area types
// Description: Get all administrative area types (ward, neighbourhood, etc.) for a given city
router.post("/2", async (req, res) => {
  if (!req.body.cityName) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
  } else {
    const prefix = String(req.body.cityName).split("#")[0];
    const suffix = String(req.body.cityName).split("#")[1];

    const query = `
      PREFIX CITY: <${prefix}#>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      
      SELECT DISTINCT ?AdminAreaType WHERE {
          CITY:${suffix} ?p ?AdminArea.
          ?AdminArea rdf:type ?AdminAreaType.
          ?AdminAreaType rdfs:subClassOf iso50872:CityAdministrativeArea.
      }
    `;
    
    const client = new SparqlClient({ endpointUrl });

    // Check if city is in database; if not, quit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${prefix}#>
      PREFIX i50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      ASK {
        CITY:${suffix} rdf:type i50872:City.
      }
    `);

    if (!doesCityExist) {
      res.status(400);
      res.json({message:"Bad request: Provided city does not exist"});
    }

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
});

// API 3
// Type: POST
// URL: /api/3/
// Input: Name of city (cityName), name of administrative area type (adminType)
// Output: List of all admin area instances for the given type and city
router.post("/3", async (req, res) => {
  if (!req.body.cityName || !req.body.adminType) {
    res.status(400);
    res.json({message:"Bad request: missing cityName or adminType"});
  } else {
    const prefix = String(req.body.cityName).split("#")[0];
    const citySuffix = String(req.body.cityName).split("#")[1];
    const adminTypeSuffix = String(req.body.adminType).split("#")[1];

    const query = `
      PREFIX CITY: <${prefix}#>
      PREFIX iso50872: <http://ontology.eil.utoronto.ca/5087/2/City/>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

      SELECT DISTINCT ?adminAreaInstance ?areaName WHERE {
        CITY:${citySuffix} ?p ?adminAreaInstance.
        ?adminAreaInstance rdfs:comment ?areaName.
        ?adminAreaInstance rdf:type CITY:${adminTypeSuffix}.
      }
    `;

    const client = new SparqlClient({ endpointUrl });

    // Check if city is in database; if not, quit
    const doesCityExist = await client.query.ask(`
      PREFIX CITY: <${prefix}#>
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
      PREFIX CITY: <${prefix}#>
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

    const stream = await client.query.select(query);

    var result = [];

    stream.on('data', row => {
      var singleRow = {};
      // Version for simply putting each result value into the final array
      Object.entries(row).forEach(([key, value]) => {
        singleRow[key] = value.value;
        // singleRow.push(value.value);
      });
      result.push(singleRow);
    });
  
    stream.on('end', () => {
      res.json({message: "success", adminAreaInstanceNames: result});
    });
    
    stream.on('error', err => {
      res.status(500).send('Oops, error!');
    });
  }
});

// API 4
// Type: POST
// URL: /api/4/
// Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance), indicators (indicatorNames), time range (timeStart, timeEnd)
// Output: Corresponding visualization and indicator data from connected database
// OPTIONAL: adminInstance, 
router.post("/4", async (req, res) => {
  // ----------- MISSING REQUEST VARIABLE HANDLING -----------
  if (!req.body.cityName) {
    res.status(400);
    res.json({message:"Bad request: missing cityName"});
  } else if (!req.body.adminType) {
    res.status(400);
    res.json({message:"Bad request: missing adminType"});
  } else if (!req.body.adminInstance) {
    res.status(400);
    res.json({message:"Bad request: missing adminInstance"});
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
    const adminInstanceSuffix = String(req.body.adminInstance).split("#")[1];

    const indicatorPrefix = String(req.body.indicatorName).split("#")[0];
    const indicatorSuffix = String(req.body.indicatorName).split("#")[1].slice(0, -4);

    const startTime = parseInt(req.body.startTime);
    const endTime = parseInt(req.body.endTime);

    var finalResult = {};
    
    const client = new SparqlClient({ endpointUrl });

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
      
      for (let year = startTime; year <= endTime; year++) {
        
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
                    CITY:${adminInstanceSuffix} iso5087m:hasProperPart ?overlappingArea.
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
                  res.json({message:"Bad request: No indicator data for given admin area type of smaller"});
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
                        finalResult[year] = NaN;
                        // res.status(500);
                        // res.json({message:"Bad request: Result of query is not a numerical value."});
                      }
                    });
                  });
          
                  getValuesForOverlappingAreas.on('end', () => {
                    if (!hasData) {
                      finalResult[year] = NaN;
                      // res.status(500);
                      // res.json({message:"Bad request: No data for given parameters"});
                    } else {
                      finalResult[year] = result;
                      // res.json({message:"success", indicatorDataValue:result});
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
            finalResult[year] = NaN;
            // res.status(400);
            // res.json({message:`Bad request: indicator ${indicatorPrefix}#${indicatorSuffix} has no associated data, for any administrative area, in the database.`});
          }
          // }
        
        } else {
          var result = 0;

          indicatorDataStream = await client.query.select(`
            PREFIX CITY: <${cityPrefix}#>
            PREFIX INDICATOR: <${indicatorPrefix}#>
            PREFIX iso21972: <http://ontology.eil.utoronto.ca/ISO21972/iso21972#>

            SELECT ?value WHERE {
              INDICATOR:${adminInstanceSuffix}${indicatorSuffixWithYear} iso21972:value ?measure.
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
                finalResult[year] = NaN;
                // res.status(500);
                // res.json({message:"Bad request: Result of query is not a numerical value."});
              }
            });
          });

          indicatorDataStream.on('end', () => {
            if (!hasData) {
              finalResult[year] = NaN;
            } else {
              finalResult[year] = result;
            }
          });

          indicatorDataStream.on('error', err => {
            res.status(500).send('Oops, error!');
          });
        }
      }
      res.json({message:"success", indicatorDataValues:{[`${cityPrefix}#${adminInstanceSuffix}`]:finalResult}});
      
    });

    adminAreaTypeNameStream.on('error', err => {
      res.status(500).send('Oops, error!');
    });
  }
});

module.exports = router;