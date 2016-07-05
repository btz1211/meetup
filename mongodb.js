var winston = require('winston');
var config = require('./config');
var mongoose = require( 'mongoose' );

// Create the database connection
mongoose.connect(config.db.mongodb);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  winston.info('Mongoose default connection open to ' + config.db.mongodb);
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

// BRING IN YOUR SCHEMAS & MODELS // For example
require('./models/user');
require('./models/meetup');
require('./models/meetuper');
require('./models/relationship');
