'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, meetupApiService){
  $scope.selectedMeetup = "";
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.currentLocation = {};

  meetupApiService.getMeetups($scope.loggedInUser._id).
  $promise.then(
    function(response){
      $scope.meetups = response.data;
      console.log(response);
  }).catch(
    function(error){
      $log.warn(error);
  });

  $scope.showMeetupInfo = function(meetup){
    console.log('meetup::' + meetup._id);
    $window.location.href = '#/meetup/' + meetup._id;
  }

  $scope.newMeetup = function(){
    $window.location.href= '#/meetup/new';
  }

  $scope.updateLocation = function(){
    navigator.geolocation.getCurrentPosition(function(position, error){
      console.log('position received::' + JSON.stringify(position.coords));
      meetupApiService.updateLocation($scope.loggedInUser._id, position.coords);
    });
  }

  $scope.updateLocation();
});
