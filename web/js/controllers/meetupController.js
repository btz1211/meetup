'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $interval, $log, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.meetupMarker = {};
  $scope.meetuperMarkers = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement, 40, -95, 4);
  $scope.socket = io();

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

      // listen for socket
      $scope.socket.on('locationUpdate', function(locationInfo){
        console.log('update received::' + JSON.stringify(locationInfo));

        if(Object.keys($scope.meetuperMarkers).includes(locationInfo.userId)){
          mapService.moveMarker($scope.meetuperMarkers[locationInfo.userId], locationInfo.latitude, locationInfo.longitude);
        }
      });
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
    mapService.zoomIn($scope.map, meetuper.lastKnownLatitude, meetuper.lastKnownLongitude, 16);
    console.log('focusing on meetuper::' + JSON.stringify(meetuper));
  }

  $scope.refocus = function(){
    var markers = Object.values($scope.meetuperMarkers).concat($scope.meetupMarker);
    mapService.refocus($scope.map, markers);
  }

  $scope.updateLocation = function(){
    navigator.geolocation.getCurrentPosition(function(position, error){
      $scope.socket.emit('locationUpdate', { userId: $scope.loggedInUser._id,
        latitude: position.coords.latitude, longitude: position.coords.longitude });
    });
  }

  //close socket when user navigates away from this page
  $scope.$on('$locationChangeStart', function (event, next, current) {
    $scope.socket.onclose = function(){}; // disable onclose handler first
    $scope.socket.close()  ;
  });

  $interval(function(){
    $scope.updateLocation();
  }, 2500);

  $scope.getMeetup();
  $scope.getMeetupers();
});
