'use strict';

myApp.controller('meetupCtrl', function($scope, $routeParams, $log, mapService, meetupApiService){
  console.log('route param:' + $routeParams.meetupId);
  $scope.meetup = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = {};
  $scope.meetupMarker = {};
  $scope.meetperMarkers = [];

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

});
