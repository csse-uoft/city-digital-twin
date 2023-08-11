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

      SELECT DISTINCT ?AdminAreaTypeInstance WHERE {
        CITY:${citySuffix} ?p ?AdminAreaTypeInstance.
        ?AdminAreaTypeInstance rdf:type CITY:${adminTypeSuffix}.
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
      // Version for simply putting each result value into the final array
      Object.entries(row).forEach(([key, value]) => {
        result.push(value.value);
      });
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
// Input: Name of city (cityName), admin area type (adminType), admin area instance (adminInstance), indicators (indicatorName), time range (timeStart, timeEnd)
// Output: Corresponding visualization and indicator data from connected database
// router.post("/4", (req, res) => {

// });

module.exports = router;

