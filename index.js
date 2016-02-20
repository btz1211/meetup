var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var db = require('./mongodb');
var meetupCtrl = require('./controller.js');
var app = express();

//build root path for serving the front end
var root = path.join(__dirname, '/web');
console.log('root path::' + root);
app.use(express.static(root));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//restful api
app.get("/api/users/:userId", meetupCtrl.getUser);
app.get("/api/users/:userId/:password", meetupCtrl.authenticateUser);
app.get("/api/meetups/:userId", meetupCtrl.getMeetups);
app.get("/api/meetup/:meetupId", meetupCtrl.getMeetup);
//app.get("/api/relationships/:userId", meetupCtrl.getRelationships);
app.get("/api/friends/:userId", meetupCtrl.getFriends);

app.post("/api/users", meetupCtrl.createUser);
app.post("/api/meetups", meetupCtrl.createMeetup);
app.post("/api/meetupers", meetupCtrl.createMeetupers);
app.post("/api/relationships", meetupCtrl.createRelationship);

app.put("/api/relationships/:relationshipId", meetupCtrl.verifyFriendship);
app.listen(8002);
console.log('listening on port 8002...');
