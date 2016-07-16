var winston = require('winston');
var config = require('./config');
var mongoose = require( 'mongoose' );

// Create the database connection
mongoose.connect(config.db.uri, config.db.options);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  winston.info('Mongoose default connection open to ' + config.db.uri);
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  winston.info('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  winston.info('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    winston.info('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});
