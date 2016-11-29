'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $interval, $log, mapService, alertService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.lastPosition = {};
  $scope.meetupMarker = {};
  $scope.meetuperMarkers = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement, 40, -95, 4);

  //meetup
  $scope.meetup = {};
  $scope.meetupers = {};

  /* socket logic */
  $scope.io = io();
  $scope.socket = $scope.io.connect();
  $scope.socket.emit('userLive', $scope.loggedInUser);

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

  $scope.socket.on('userLive', function(meetuper){
    alertService.addAlert(alertService.alertType.SUCCESS,
      $scope.loggedInUser.firstName + " " +$scope.loggedInUser.lastName + " is now live");
  });

  $scope.socket.on('userExitLive', function(meetuper){
    alertService.addAlert(alertService.alertType.WARNING,
      $scope.loggedInUser.firstName + " " +$scope.loggedInUser.lastName + " has exited");
  });

  $scope.socket.onclose = function(){
    if($scope.lastCoords){
      meetupApiService.updateLocation($scope.loggedInUser._id, $scope.lastCoords);
    }
  }

  $scope.$on('$locationChangeStart', function (event, next, current) {
    $scope.socket.emit('userExitLive', $scope.loggedInUser);
    $scope.socket.close();
  });

  /* location update logic */
  $scope.onLocationUpdate = function(position){
    $scope.lastCoords = position.coords;

    $scope.socket.emit('locationUpdate', { user: $scope.loggedInUser,
      latitude: $scope.lastCoords.latitude, longitude: $scope.lastCoords.longitude });
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

  /* controller functions */
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

      response.data.map(function(meetuper){
        $scope.meetupers[meetuper._id] = meetuper;
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

  $scope.getMeetup();
  $scope.getMeetupers();
});
