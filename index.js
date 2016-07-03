var winston = require('winston');
var db = require('./mongodb');
var config = require('./config');
var server = require('./server');

// We will log normal api operations into api.log
console.log("starting logger...");
winston.add(winston.transports.File, {
  filename: config.logger.api
});
winston.handleExceptions(new winston.transports.File({
	filename: config.logger.exception
}));
console.log("logger started. Connecting to MongoDB...");

server.start();
console.log("Successfully started web server. Waiting for incoming connections...");
