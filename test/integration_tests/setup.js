var should = require('should');
var promise = require('bluebird');
var mongoose = require('mongoose');
var config = require.main.require('config');
var app = require.main.require('server');

var conn;
var server;

mongoose.Promise = Promise;

before(function(done){
  conn = mongoose.connect(config.db.uri + '/meetup-test', config.db.options);
  server = app.listen(app.get('port'));
  done();
});

after(function(done){
  //clear test database
  conn.connection.db.dropDatabase();
  conn.connection.close();

  //close server
  server.close();
  done();
});

exports.server = app;
