'use strict';

myApp.controller('meetupCtrl', function($scope, $routeParams, $log, mapService, meetupApiService){
  console.log('route param:' + $routeParams.meetupId);
  $scope.meetup = {};
  $scope.mapElement = document.getElementById('map');

  meetupApiService.getMeetup($routeParams.meetupId)
  .$promise.then(function(response){
    $log.info("meetup:"+ JSON.stringify(response));
    $scope.meetup = response.data;
    $scope.map = mapService.getMeetupMap($scope.meetup, $scope.mapElement);
  }).catch(
    function(error){
      $log.warn(error);
  });

});
