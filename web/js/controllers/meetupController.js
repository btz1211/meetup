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

  $scope.focusOnMeetuper = function(meetuper){
    var marker = $scope.meetuperMarkers[meetuper._id];
    mapService.zoomIn($scope.map, meetuper.lastKnownLatitude, meetuper.lastKnownLongitude);
    console.log('focusing on meetuper::' + JSON.stringify(meetuper));
  }
  $scope.getMeetup();
  $scope.getMeetupers();
});
