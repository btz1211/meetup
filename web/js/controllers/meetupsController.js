'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, $route, $interval, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //meetup vars
  $scope.meetup = {};
  $scope.selectedMeetup = "";
  $scope.currentLocation = {};

  //friends/user vars
  $scope.friendInvitations = [];

  /*******Meetup container*********/
  $scope.getMeetups = function(){
    meetupApiService.getMeetups($scope.loggedInUser._id).
    $promise.then(
      function(response){
        if(response.data){
          $scope.meetups = response.data;
        }
      }).catch(
        function(error){
          $log.warn(error);
    });
  }

  $scope.editMeetup = function(meetup){
    //clone meetup, don't want the original be changed
    $scope.meetup = jQuery.extend(true, {}, meetup);
    $scope.showModal();
  }

  $scope.newMeetup = function(){
    $scope.meetup = {};
    $scope.showModal();
  }

  //redirect user to meetup page
  $scope.showMeetupInfo = function(meetup){
    console.log('meetup::' + meetup._id);
    $window.location.href = '#/meetup/' + meetup._id;
  }

  /******friend requests container*******/
  $scope.getInvitations = function(){
    meetupApiService.getFriendInvitations($scope.loggedInUser._id)
    .$promise.then(
      function(response){
        $scope.friendInvitations = response.data;
        console.log("friend invitations::"+JSON.stringify(response.data));
    }).catch(
      function(error){
        $log.warn(error);
      }
    );
  }

  $scope.accept = function(user){
    meetupApiService.addFriend($scope.loggedInUser._id, user._id)
    .$promise.then(function(response){
      $scope.getInvitations();
    }).catch(function(error){
      $log.error(error);
    })
  }

  /******helper functions*******/
  $scope.showModal = function(){
    $("#editMeetupModal").modal('show');
  }

  $scope.parseDate = function(date){
    return new Date( Date.parse( date ) );
  }

  //update user's current location on the backend
  $scope.updateLocation = function(){
    navigator.geolocation.getCurrentPosition(function(position, error){
      console.log('position received::' + JSON.stringify(position.coords));
      meetupApiService.updateLocation($scope.loggedInUser._id, position.coords);
    });
  }

  $interval(function(){
    $scope.getMeetups();
  }, 2500);

  $scope.getMeetups();
  $scope.updateLocation();
  $scope.getInvitations()
});
