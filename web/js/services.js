'use strict';

myApp.factory('meetupApiService', function($resource){
  var getMeetupResource = $resource("/api/meetups/:userId", {userId:"@userId"});
  var createMeetupResource = $resource("/api/meetups");
  var getUserResource = $resource("/api/users/:userId", {userId:"@userId"});
  var authenicateUserResource = $resource("/api/users/:userId/:password", {userId:"@userId", password:"@password"});
  var createUserResource = $resource("/api/users");

  return{
    getMeetups: function(targetUserId){
      return getMeetupResource.get({userId:targetUserId});
    },

    saveMeetup: function(meetup){
      console.log("[INFO] - saving meetup:" + JSON.stringify(meetup));
      return createMeetupResource.save(meetup);
    },

    authenticateUser: function(user){
      console.log("[INFO] - authenticating user:" + JSON.stringify(user));
      return authenicateUserResource.get({userId:user.userId, password:user.password});
    },

    getUser: function(user){
      return getUserResource.get({userId:user.userId});
    },

    createUser: function(user){
      console.log("[INFO] - saving user:" + JSON.stringify(user));
      return createUserResource.save(user);
    }
  }
});

myApp.factory('sharedDataService',function(){
  var loggedInUser;
  return  {
    getLoggedInUser: function(){
      return loggedInUser;
    },
    setLoggedInUser:function(user){
      loggedInUser = user;
    }
  }
});
