'use strict';

myApp.factory('meetupApiService', function($resource){
  var getMeetupResource = $resource("/api/meetup/:meetupId", {meetupId:"@meetupId"});
  var getMeetupsResource = $resource("/api/meetups/:userId", {userId:"@userId"});
  var createMeetupResource = $resource("/api/meetup");
  var getUserResource = $resource("/api/user/:userId", {userId:"@userId"});
  var searchUsersResource = $resource("/api/users/:searchString", {searchString:"@searchString"});
  var createUserResource = $resource("/api/user");
  var authenicateUserResource = $resource("/api/user/:userId/:password", {userId:"@userId", password:"@password"});
  var addFriendResource = $resource("/api/friend/add/:source/:target", null, {'update':{method:'PUT'}});
  var getFriendsResource = $resource("/api/friends/:userId", {userId:"@userId"});
  var getFriendRequestsResource = $resource("/api/friend-requests/:userId", {userId:"@userId"});
  var getFriendInvitationsResource = $resource("/api/friend-invitations/:userId", {userId:"@userId"});
  var searchFriendsResource = $resource("/api/friends/:userId/search/:searchString", {userId:"@userId", searchString:"@searchString"});
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

    getUser: function(user){
      return getUserResource.get({userId:user.userId});
    },

    createUser: function(user){
      return createUserResource.save(user);
    },

    searchUsers: function(searchString){
      console.log("[INFO] - searching:" + searchString);
      return searchUsersResource.get({searchString: searchString});
    },

    authenticateUser: function(user){
      console.log("[INFO] - authenticating user:" + JSON.stringify(user));
      return authenicateUserResource.get({userId:user.userId, password:user.password});
    },

    addFriend: function(sourceUserId, targetUserId){
      console.log('[INFO] - source user:' + sourceUserId + ', target user:' + targetUserId);
      return addFriendResource.update({source:sourceUserId, target:targetUserId}, null);
    },

    getFriends: function(targetUserId, lastUserId, limit){
      return getFriendsResource.get({userId:targetUserId}, {'lastUserId':lastUserId, 'limit':limit});
    },

    getFriendRequests: function(targetUserId){
      return getFriendRequestsResource.get({userId:targetUserId});
    },

    getFriendInvitations: function(targetUserId){
      return getFriendInvitationsResource.get({userId:targetUserId});
    },

    searchFriends: function(targetUserId, searchString){
      return searchFriendsResource.get({userId:targetUserId, searchString:searchString});
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
