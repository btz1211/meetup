'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $log, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.map = {};
  $scope.mapElement = document.getElementById('map');
  $scope.meetupMarker = {};
  $scope.meetperMarkers = [];

  //meetup
  $scope.meetup = {};
  $scope.friends = [];
  $scope.selectedFriends = [];

  meetupApiService.getMeetup($routeParams.meetupId)
  .$promise.then(function(response){
    $log.info("meetup:"+ JSON.stringify(response));
    $scope.meetup = response.data;
    $scope.map = mapService.getMap( $scope.mapElement, $scope.meetup.latitude, $scope.meetup.longitude, 14);

    //mark meetup
    $scope.meetupMarker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.meetup.name);

    //mark meetupers
    var meetuper;
    for(var i = 0; i < $scope.meetup.meetupers.length; ++i){
      meetuper = $scope.meetup.meetupers[i];
      if(meetuper.latitude && meetuper.longitude){
        $scope.meetuperMarkers.push(mapService.addMarker($scope.map, meetuper.lastKnownLatitude, meetuper.lastKnownLongitude, meetuper.lastName + "," +meetuper.firstName));
      }
    }
  }).catch(
    function(error){
      $log.warn(error);
  });

  $scope.getFriends = function(){
    //getting the last user in the friends array
    //necessary for fast paging in mongodb
    var friendCount = $scope.friends.length;
    var lastUserId = friendCount > 0 ? $scope.friends[friendCount - 1]._id : null;

    meetupApiService.getFriends($scope.loggedInUser._id, lastUserId, 1)
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
    $log.info("item:"+JSON.stringify(item) + ":"+JSON.stringify(model) + ":"+JSON.stringify(label));
    $scope.searchString = "";
    $scope.selectedFriends.push(item);
  }

  $scope.getFriends();
});
