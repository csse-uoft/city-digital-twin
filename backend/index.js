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
var bodyParser = require('body-parser');
var multer = require('multer');
var cors = require('cors');
var upload = multer();

var app = express();

var api = require('./routes/api.js');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

// require("./routes.js");

app.use("/api", api);

app.listen(3000);