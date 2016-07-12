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
var expressLogFile = fs.createWriteStream('./logs/express.log', {flags: 'a'});

//app configuration
app.use(express.static(root));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var start = function(){
  routes.setup(app);
  var port = process.env.PORT || 8002;
  app.listen(port);
  winston.info("Server listening on port %d in %s mode", port, app.settings.env);
}

module.exports.start = start;
module.exports.app = app;
