var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var winston = require('winston')
var routes = require('./routes')
var fs = require('fs');

//build root path for serving the front end
var root = path.join(__dirname, '/web');
winston.info('root path::' + root);

var app = express();

//app configuration
app.use(express.static(root));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//set up api routes
routes.setup(app);

var port = process.env.PORT || 8002;
app.set('port', port);

module.exports = app;
