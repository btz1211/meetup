'use strict';

myApp.controller('meetupCtrl', function($scope, $cookies, $routeParams, $interval, $log,
  mapService, alertService, socketService, locationService, meetupApiService){

  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //map
  $scope.meetupMarker = {};
  $scope.meetuperMarkers = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement, 40, -95, 4);

  //meetup
  $scope.meetup = {};
  $scope.meetupers = {};
  $scope.meetuperToFollow = {};

  /* socket logic */
  socketService.on('locationUpdate', function(locationInfo){
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

    //refocus the map to the meetuper to follow
    if(locationInfo.user._id === $scope.meetuperToFollow){
      mapService.zoomInOnMarker($scope.map, $scope.meetuperMarkers[locationInfo.user._id]);
    }
  });

  socketService.on('userLive', function(meetuper){
    alertService.addAlert(alertService.alertType.SUCCESS,
      meetuper.firstName + " " + meetuper.lastName + " is now live");
  });

  socketService.on('connect', function(){
    console.log('connection established');

    //start location tracking
    locationService.start($scope.loggedInUser);

    //notify users
    socketService.emit('userLive', $scope.loggedInUser);
  });

  socketService.on('disconnect', function(){
    console.log('connection disconnected');

    //stop location tracking
    locationService.stop();
    locationService.getCurrentPosition(function(position){
      meetupApiService.updateLocation($scope.loggedInUser._id, position.coords);
    });
  });

  /* controller functions */
  $scope.getMeetup = function(){
    meetupApiService.getMeetup($routeParams.meetupId)
    .$promise.then(function(response){
      $scope.meetup = response.data;

      //map meetup
      $scope.meetupMarker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.meetup.name, "", "images/destination-marker.png");
      mapService.zoomInOnMarker($scope.map, $scope.meetupMarker, 14);
    }).catch(
      function(error){
        $log.warn(error);
    });
  }

  $scope.getMeetupers = function(){
    meetupApiService.getMeetupers($routeParams.meetupId)
    .$promise.then(function(response){

      //map meetupers on map
      response.data.map(function(meetuper){
        $scope.meetupers[meetuper._id] = meetuper;
        $scope.meetuperMarkers[meetuper._id] = null;

        if(meetuper.lastKnownLatitude && meetuper.lastKnownLongitude){
          $scope.meetuperMarkers[meetuper._id] = mapService.addMarker($scope.map, meetuper.lastKnownLatitude,
            meetuper.lastKnownLongitude, meetuper.firstName + ' ' +meetuper.lastName);
        }
      });
    });
  }

  $scope.focusOnMeetuper = function(meetuper){
    var marker = $scope.meetuperMarkers[meetuper._id];

    mapService.zoomInOnMarker($scope.map, marker, 16);

    //set the meetuper to be the one to follow
    $scope.meetuperToFollow = meetuper._id;
  }

  $scope.refocus = function(){
    var markers = Object.values($scope.meetuperMarkers).concat($scope.meetupMarker);
    mapService.refocus($scope.map, markers);

    //clear the focus
    $scope.meetuperToFocus = meetuper._id;
  }

  $scope.getMeetup();
  $scope.getMeetupers();
});
