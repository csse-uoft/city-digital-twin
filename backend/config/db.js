// const {GraphDB, initGraphDB, MongoDBIdGenerator, Types, createGraphDBModel} = require("graphdb-utils");

// // ID Generator for creating new instances
// const idGenerator = new MongoDBIdGenerator("mongodb://127.0.0.1:27017/gdb-utils");

// // This determines the prefixes.
// // For example, `ic:Address` is same as `http://ontology.eil.utoronto.ca/tove/icontact#Address`
// const namespaces = {
//   "": "http://gdb-utils#",
//   'cids': 'http://ontology.eil.utoronto.ca/cids/cids#',
//   'foaf': 'http://xmlns.com/foaf/0.1/',
//   'cwrc': 'http://sparql.cwrc.ca/ontologies/cwrc#',
//   'ic': 'http://ontology.eil.utoronto.ca/tove/icontact#',
//   '50872': 'http://ontology.eil.utoronto.ca/5087/2#'
// };

// const result = await initGraphDB({
//   idGenerator,
//   // GraphDB Server Address
//   address: "http://ec2-3-97-59-180.ca-central-1.compute.amazonaws.com:7200/repositories/CACensus",
//   // Remove the username and password fields if the GraphDB server does not require authentication 
//   username: "gord.lin@mail.utoronto.ca",
//   password: "Summer2023",
//   namespaces,
//   // The repository name, a new repository will be created if does not exist.
//   repositoryName: 'CACensus',
// });

// const cityModel = createGraphDBModel({
//   city: {type: String, internalKey: '50872:City'}
//   }, {
//   rdfTypes: 
// });

