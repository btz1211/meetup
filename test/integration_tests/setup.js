process.env.NODE_ENV = 'test';

var mongoose = require('mongoose');
var config = require.main.require('config');
var app = require.main.require('server');

var conn;
var server;

before(function(done){
  conn = mongoose.connect(config.db.uri);
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
