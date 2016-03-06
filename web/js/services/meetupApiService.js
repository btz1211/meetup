'use strict';

myApp.factory('meetupApiService', function($resource){
  var getMeetupResource = $resource("/api/meetup/:meetupId", {meetupId:"@meetupId"});
  var getMeetupsResource = $resource("/api/meetups/:userId", {userId:"@userId"});
  var createMeetupResource = $resource("/api/meetup");
  var getUserResource = $resource("/api/user/:userId", {userId:"@userId"});
  var authenicateUserResource = $resource("/api/user/:userId/:password", {userId:"@userId", password:"@password"});
  var createUserResource = $resource("/api/user");
  var getFriendsResource = $resource("/api/friends/:userId", {userId:"@userId"});
  var updateLocationResource = $resource("/api/user/location/:userId", null, {'update':{method:'PUT'}});

  return{
    getMeetup: function(targetMeetupId){
      return getMeetupResource.get({meetupId:targetMeetupId});
    },

    getMeetups: function(targetUserId){
      return getMeetupsResource.get({userId:targetUserId});
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
      return createUserResource.save(user);
    },

    getFriends: function(targetUserId){
      return getFriendsResource.get({userId:targetUserId});
    },

    updateLocation: function(targetUserId, location){
      console.log("[INFO] - latitude::"+ location.latitude + ", longitude::"+ location.longitude + " for user::" + targetUserId);
      return updateLocationResource.update({userId:targetUserId}, {'latitude':location.latitude, 'longitude':location.longitude});
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
