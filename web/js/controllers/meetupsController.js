'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, meetupApiService){
  $scope.selectedMeetup = "";
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

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
    /*
    if($scope.selectedMeetup === meetup){
      $scope.selectedMeetup = "";
    }else{
      $scope.selectedMeetup = meetup;
    }*/

  }

/*
  $scope.isSelectedMeetup = function(meetup){
    return $scope.selectedMeetup === meetup;
  }
*/
});
