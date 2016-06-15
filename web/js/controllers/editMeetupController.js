'use strict';

myApp.controller('editMeetupCtrl', function($scope, $log, $http, $window, $cookies, meetupApiService, mapService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.selectedFriends = [];
  $scope.friends = [];
  $scope.limit = 1;

  $scope.getFriends = function(){
    var friendCount = $scope.friends.length;
    var lastUserId = friendCount > 0 ? $scope.friends[friendCount - 1]._id : null;

    meetupApiService.getFriends($scope.loggedInUser._id, lastUserId,$scope.limit)
    .$promise.then(function(response){
      console.log('next batch of friends:' + JSON.stringify(response.data));
      $scope.friends = response.data;
    }).catch(function(error){
      $log.warn(error);
    });
  }

  $scope.searchFriends = function(searchString){
    return meetupApiService.searchFriends($scope.loggedInUser._id, searchString)
    .$promise.then(function(response){
      return response.data.map(function(user){
        user.fullName = user.firstName + ' ' + user.lastName;
        return user;
      })
    }).catch(function(error){
      $log.warn(error);
    });
  }

  $scope.onFriendSelected = function(item, model, label){
    $log.info("called");
  }

  $scope.getFriends();

});
