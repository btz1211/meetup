'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $log, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.meetupMarker = {};
  $scope.meetuperMarkers = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement, 40, -95, 4);

  //meetup
  $scope.meetup = {};
  $scope.meetupers = [];
  $scope.friends = [];
  $scope.selectedFriends = {};

  $scope.getMeetup = function(){
    meetupApiService.getMeetup($routeParams.meetupId)
    .$promise.then(function(response){
      $log.info("meetup:"+ JSON.stringify(response));
      $scope.meetup = response.data;

      //map meetup
      $scope.meetupMarker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.meetup.name, "", "images/destination-marker.png");
      mapService.zoomIn( $scope.map, $scope.meetup.latitude, $scope.meetup.longitude, 14);
    }).catch(
      function(error){
        $log.warn(error);
    });
  }

  $scope.getMeetupers = function(){
    meetupApiService.getMeetupers($routeParams.meetupId)
    .$promise.then(function(response){
      $log.info("meetupers::"+JSON.stringify(response.data));
      $scope.meetupers = response.data;

      //map meetupers
      $scope.meetupers.map(function(meetuper){
        if(meetuper.lastKnownLatitude && meetuper.lastKnownLongitude){
          $scope.meetuperMarkers[meetuper._id] = mapService.addMarker($scope.map, meetuper.lastKnownLatitude,
            meetuper.lastKnownLongitude, meetuper.firstName + ' ' +meetuper.lastName,
            "",
            "images/meetuper-marker.png");
        }
      });
    });
  }

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

    if(!$scope.isFriendSelected(item)){
      $scope.selectedFriends[item._id] = item;
    }
  }

  $scope.getNumberOfSelectedFriends = function(){
    return Object.keys($scope.selectedFriends).length;
  }

  $scope.isFriendSelected = function(friend){
    return $scope.selectedFriends.hasOwnProperty(friend._id);
  }

  $scope.addMeetupers = function(){
    var promises = [];
    Object.keys($scope.selectedFriends).forEach(function(friend){
      promises.push(meetupApiService.addMeetuper($routeParams.meetupId, friend).$promise);
    });

    Promise.all(promises)
    .then(function(){
      $scope.getMeetupers();
    }).catch(function(error){
      $log.warn(error);
    })
  }

  $scope.focusOnMeetuper = function(meetuper){
    var marker = $scope.meetuperMarkers[meetuper._id];
    mapService.zoomIn($scope.map, meetuper.lastKnownLatitude, meetuper.lastKnownLongitude);
    console.log('focusing on meetuper::' + JSON.stringify(meetuper));
  }
  $scope.getMeetup();
  $scope.getMeetupers();
  $scope.getFriends();
});
