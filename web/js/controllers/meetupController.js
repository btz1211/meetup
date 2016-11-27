'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $interval, $log, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.meetupMarker = {};
  $scope.meetuperMarkers = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement, 40, -95, 4);

  //meetup
  $scope.meetup = {};
  $scope.meetupers = [];

  //meetup socket
  $scope.socket = io();
  $scope.socket.on('locationUpdate', function(locationInfo){
    console.log('update received::' + JSON.stringify(locationInfo));

    if($scope.meetuperMarkers[locationInfo.user._id]){
      mapService.moveMarker($scope.meetuperMarkers[locationInfo.user._id], locationInfo.latitude, locationInfo.longitude);
    }else{
      $scope.meetuperMarkers[locationInfo.user._id] = mapService.addMarker($scope.map,
                                             locationInfo.latitude,
                                             locationInfo.longitude,
                                             locationInfo.user.firstName + " " + locationInfo.user.lastName,
                                             "",
                                             "images/meetuper-marker.png");
    }
  });

  /* location update logic */
  $scope.onLocationUpdate = function(position){
    var coordinates = position.coords;

    $scope.socket.emit('locationUpdate', { user: $scope.loggedInUser,
      latitude: position.coords.latitude, longitude: position.coords.longitude });
  }

  $scope.onLocationUpdateError = function(error){
    console.warn('ERROR(' + error.code + '): ' + error.message);
  }

  $scope.LocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  navigator.geolocation.watchPosition($scope.onLocationUpdate, $scope.onLocationUpdateError, $scope.LocationOptions);

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
        $scope.meetuperMarkers[meetuper._id] = null;

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

  /* close socket when user navigates away from this page */
  $scope.$on('$locationChangeStart', function (event, next, current) {
    $scope.socket.onclose = function(){}; // disable onclose handler first
    $scope.socket.close()  ;
  });

  $scope.getMeetup();
  $scope.getMeetupers();
});
