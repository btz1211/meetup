var winston = require('winston');
var db = require('./mongodb');
var config = require('./config');
var server = require('./server');

server.start();
