var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./mongodb');
var meetupCtrl = require('./controller.js');
var app = express();
var Geoservice = require('./geoservice.js');
var geoservice = new Geoservice();

//build root path for serving the front end
var root = path.join(__dirname, '/web');
console.log('root path::' + root);
app.use(express.static(root));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//restful api
app.get("/api/user/:userId", meetupCtrl.getUser);
app.get("/api/user/:userId/:password", meetupCtrl.authenticateUser);
app.get("/api/meetups/:userId", meetupCtrl.getMeetups);
app.get("/api/meetup/:meetupId", meetupCtrl.getMeetup);
//app.get("/api/relationships/:userId", meetupCtrl.getRelationships);
app.get("/api/friends/:userId", meetupCtrl.getFriends);
app.get("/api/users/:searchString", meetupCtrl.searchUsers);

app.post("/api/user", meetupCtrl.createUser);
app.post("/api/meetup", meetupCtrl.createMeetup);
app.post("/api/meetupers", meetupCtrl.createMeetupers);
app.post("/api/relationship", meetupCtrl.createRelationship);

app.put("/api/relationship/:relationshipId", meetupCtrl.verifyFriendship);
app.put("/api/user/location/:userId", meetupCtrl.updateLocation);

/**api for geting coordinates from address**/
app.get('/api/geolocation', function(req, res){
  var address = req.query.address;

  if(!address){
    res.status(400);
    res.end('invalid address');
    return;
  }

  geoservice.getCoordinateInfo(address, res);
  geoservice.on('error', function(error){
    res.status(400);
    res.end('error occurred::' + error);
  }).on('dataReady', function(data){
      res.status(200);
      console.log('[INFO] - geo::' + data.results[0].geometry.location.lat);
      res.end(JSON.stringify(data));

  });
});

app.listen(8002);
console.log('listening on port 8002...');
