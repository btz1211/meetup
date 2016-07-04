var MeetupService = require('./services/MeetupService.js')
var UserService = require('./services/UserService.js')

var userService = new UserService();
var meetupService = new MeetupService();
var setup = function(app){

  //user api
  app.post("/api/user", userService.createUser);
  app.get("/api/user/:userId", userService.getUser);
  app.get("/api/users/:searchString", userService.getUsers);
  app.get("/api/user/:userId/:password", userService.authenticateUser);
  app.put("/api/user/location/:userId", userService.updateLocation);

  //friend api
  app.get("/api/friends/:userId", userService.getFriends);
  app.get("/api/friend-requests/:userId", userService.getFriendRequests);
  app.get("/api/friend-invitations/:userId", userService.getFriendInvitations);
  app.put("/api/friend/add/:source/:target", userService.addFriend);
  app.put("/api/friend/check/:source/:target", userService.checkFriend);
  app.get("/api/friends/:userId/search/:searchString", userService.searchFriends);

  //meetup api
  app.post("/api/meetup", meetupService.createMeetup);
  app.get("/api/meetup/:meetupId", meetupService.getMeetup);
  app.get("/api/meetups/:userId", meetupService.getMeetups);
  app.get("/api/meetup/:meetupId/meetupers", meetupService.getMeetupers);
  app.put("/api/meetup/:meetupId", meetupService.updateMeetup);
  app.put("/api/meetup/:meetupId/meetuper/:meetuperId", meetupService.addMeetuper);
}

module.exports.setup = setup;
