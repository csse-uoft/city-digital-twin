// NOTE: the backend is required due to CORS policy
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var upload = multer();

var app = express();

var api = require('./api.js');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

// require("./routes.js");

app.use("/api", api);

app.listen(3000);