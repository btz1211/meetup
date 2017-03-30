var db = require('./mongodb');
var config = require('./config');
var server = require('./server');
var winston = require('winston');
var http = require('http').Server(server);
var MeetupSocket = require('./meetupSocket');
var meetupSocket = new MeetupSocket(http);

console.log('socket::' + meetupSocket.getSocket());

http.listen(server.get('port'));
winston.info("Server listening on port %d in %s mode", server.get('port'), server.settings.env);
