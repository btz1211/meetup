var UserService = require('./services/UserService');
var FriendService = require('./services/FriendService');
var MeetupService = require('./services/MeetupService');

var userService = new UserService();
var friendService = new FriendService();
var meetupService = new MeetupService();
var setup = function(app){

  //user api
  app.post("/api/user", userService.createUser);
  app.get("/api/user/:userId", userService.getUser);
  app.get("/api/users/:searchString", userService.getUsers);
  app.get("/api/user/:userId/:password", userService.authenticateUser);
  app.put("/api/user/:userId/location", userService.updateLocation);

  //friend api
  app.get("/api/friends/:userId", friendService.getFriends);
  app.get("/api/friend/:userId/:friendId", friendService.getFriend);
  app.put("/api/friend/add/:source/:target", friendService.addFriend);
  app.get("/api/friend-requests/:userId", friendService.getFriendRequests);
  app.get("/api/friend-invitations/:userId", friendService.getFriendInvitations);
  app.get("/api/friends/:userId/search/:searchString", friendService.searchFriends);

  //meetup api
  app.post("/api/meetup", meetupService.createMeetup);
  app.get("/api/meetup/:meetupId", meetupService.getMeetup);
  app.get("/api/meetups/:userId", meetupService.getMeetups);
  app.get("/api/meetup/:meetupId/meetupers", meetupService.getMeetupers);
  app.put("/api/meetup/:meetupId", meetupService.updateMeetup);
  app.put("/api/meetup/:meetupId/meetuper/:meetuperId", meetupService.addMeetuper);
}

module.exports.setup = setup;
