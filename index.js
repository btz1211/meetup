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

//user api
app.post("/api/user", meetupCtrl.createUser);
app.get("/api/user/:userId", meetupCtrl.getUser);
app.get("/api/users/:searchString", meetupCtrl.getUsers);
app.get("/api/user/:userId/:password", meetupCtrl.authenticateUser);
app.get("/api/friends/:userId", meetupCtrl.getFriends);
app.get("/api/friend-requests/:userId", meetupCtrl.getFriendRequests);
app.get("/api/friend-invitations/:userId", meetupCtrl.getFriendInvitations);
app.put("/api/user/location/:userId", meetupCtrl.updateLocation);
app.put("/api/friend/add/:source/:target", meetupCtrl.addFriend);
app.put("/api/friend/check/:source/:target", meetupCtrl.checkFriend);
app.get("/api/friends/:userId/search/:searchString", meetupCtrl.searchFriends);

//meetup api
app.post("/api/meetup", meetupCtrl.createMeetup);
app.get("/api/meetup/:meetupId", meetupCtrl.getMeetup);
app.get("/api/meetups/:userId", meetupCtrl.getMeetups);
app.get("/api/meetup/:meetupId/meetupers", meetupCtrl.getMeetupers);
app.put("/api/meetup/:meetupId", meetupCtrl.updateMeetup);
app.put("/api/meetup/:meetupId/meetuper/:meetuperId", meetupCtrl.addMeetuper);


app.get('/api/geolocation', function(req, res){
  var address = req.query.address;
  console.log('[INFO] - received address request::' + JSON.stringify(req.query));
});

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
