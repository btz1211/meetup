'use strict';

myApp.factory('meetupApiService', function($resource){
  var getMeetupResource = $resource("/api/meetup/:meetupId", {meetupId:"@meetupId"});
  var getMeetupsResource = $resource("/api/meetups/:userId", {userId:"@userId"});
  var createMeetupResource = $resource("/api/meetup");
  var updateMeetupResource = $resource("/api/meetup/:meetupId", null, {'update':{method:'PUT'}});
  var getMeetupersResource = $resource("/api/meetup/:meetupId/meetupers");
  var addMeetuperResource = $resource("/api/meetup/:meetupId/meetuper/:meetuperId", null, {'update':{method:'PUT'}});

  var getUserByIdResource = $resource("/api/user/id/:userId", {userId:"@userId"});
  var getUserByUsernameResource = $resource("/api/user/username/:username", {username:"@username"});
  var searchUsersResource = $resource("/api/users/:searchString", {searchString:"@searchString"});
  var createUserResource = $resource("/api/user");
  var authenicateUserResource = $resource("/api/user/:userId/:password", {userId:"@userId", password:"@password"});
  var updateLocationResource = $resource("/api/user/:userId/location", null, {'update':{method:'PUT'}});

  var addFriendResource = $resource("/api/friend/add/:source/:target", null, {'update':{method:'PUT'}});
  var getFriendResource = $resource("/api/friend/:userId/:friendId", {userId:"@userId", friendId:"@friendId"});
  var getFriendsResource = $resource("/api/friends/:userId", {userId:"@userId"});
  var getFriendRequestsResource = $resource("/api/friend-requests/:userId", {userId:"@userId"});
  var getFriendInvitationsResource = $resource("/api/friend-invitations/:userId", {userId:"@userId"});
  var searchFriendsResource = $resource("/api/friends/:userId/search/:searchString", {userId:"@userId", searchString:"@searchString"});

  return{
    getMeetup: function(meetupId){
      return getMeetupResource.get({'meetupId':meetupId});
    },

    getMeetups: function(userId){
      return getMeetupsResource.get({'userId':userId});
    },

    saveMeetup: function(meetup){
      console.log("[INFO] - saving meetup:" + JSON.stringify(meetup));
      return createMeetupResource.save(meetup);
    },

    updateMeetup: function(meetup){
      console.log("[INFO] - updating meetup:" + JSON.stringify(meetup));
      return updateMeetupResource.update({'meetupId':meetup._id}, meetup);
    },

    getMeetupers: function(meetupId){
      return getMeetupersResource.get({'meetupId':meetupId});
    },

    addMeetuper: function(meetupId, meetuperId){
      console.log('[INFO] - meetup::' + meetupId + ', meetuper::'+ meetuperId);
      return addMeetuperResource.update({'meetupId':meetupId, 'meetuperId':meetuperId}, null);
    },

    getUserById: function(userId){
      return getUseByIdResource.get({userId:userId});
    },

    getUserByUsername: function(username){
      return getUserByUsernameResource.get({username:username});
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

    getFriend: function(userId, friendId){
      return getFriendResource.get({'userId':userId, 'friendId':friendId});
    },

    getFriends: function(userId, lastUserId, limit){
      return getFriendsResource.get({'userId':userId}, {'lastUserId':lastUserId, 'limit':limit});
    },

    getFriendRequests: function(userId){
      return getFriendRequestsResource.get({'userId':userId});
    },

    getFriendInvitations: function(userId){
      return getFriendInvitationsResource.get({'userId':userId});
    },

    searchFriends: function(userId, searchString){
      return searchFriendsResource.get({'userId':userId, 'searchString':searchString});
    },

    updateLocation: function(userId, location){
      console.log("[INFO] - latitude::"+ location.latitude + ", longitude::"+ location.longitude + " for user::" + userId);
      return updateLocationResource.update({'userId':userId}, {'latitude':location.latitude, 'longitude':location.longitude});
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
