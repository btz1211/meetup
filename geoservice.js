var http = require('http');
var util = require('util');
var events = require('events');
var queryConstructor = require('querystring');

var host = 'maps.googleapis.com';
var geocodePath = '/maps/api/geocode/json?'

//create Geoservice class and extend EventEmitter
var Geoservice = function(){}
Geoservice.prototype = new events.EventEmitter();

//get
Geoservice.prototype.getCoordinateInfo = function(address, resultHandler){
  var service = this;
  var options = {
    'host': host,
    'path': geocodePath += queryConstructor.stringify({'address': address}),
    'headers':{
      'Content-Type': 'application/json'
    }
  }

  console.log('[INFO] - options::' + JSON.stringify(options));

  http.request(options, function(response){
    var data ='';

    response.on('data', function(chunk){
      data += chunk;
    }).on('end', function(){
      console.log('[INFO] - result::' + data);
      service.emit('dataReady', JSON.parse(data));
    })
  }).on('error', function(error){
    service.emit('error', error);
  }).end();
}

module.exports = Geoservice;
