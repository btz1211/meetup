var db = require('./mongodb');
var config = require('./config');
var server = require('./server');
var winston = require('winston');

server.listen(server.get('port'));
winston.info("Server listening on port %d in %s mode", server.get('port'), server.settings.env);
