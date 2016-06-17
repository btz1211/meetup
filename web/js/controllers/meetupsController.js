'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, $route, $interval, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  //meetup vars
  $scope.meetup = {};
  $scope.selectedMeetup = "";
  $scope.currentLocation = {};

  //friends/user vars
  $scope.friendInvitations = [];

  $scope.getMeetups = function(){
    meetupApiService.getMeetups($scope.loggedInUser._id).
    $promise.then(
      function(response){
        if(response.data){
          $scope.meetups = response.data.map(function(meetup){
            meetup.startTime = new Date( Date.parse(meetup.startTime));
            meetup.endTime = new Date( Date.parse(meetup.endTime));
            return meetup;
          });
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

  $scope.updateLocation = function(){
    navigator.geolocation.getCurrentPosition(function(position, error){
      console.log('position received::' + JSON.stringify(position.coords));
      meetupApiService.updateLocation($scope.loggedInUser._id, position.coords);
    });
  }

  $scope.showMeetupInfo = function(meetup){
    console.log('meetup::' + meetup._id);
    $window.location.href = '#/meetup/' + meetup._id;
  }

  $scope.searchUsers = function(searchString){
    return meetupApiService.searchUsers(searchString)
    .$promise.then(function(response){
      return response.data.map(function(user){
        user.fullName = user.firstName + ' ' + user.lastName;
        return user;
      })
    }).catch(function(error){
      $log.warn(error);
    });
  }

  $scope.onUserSelect = function(item){
    $log.info("in meetups controller:"+JSON.stringify(item));
  }

  $scope.getInvitations = function(){
    meetupApiService.getFriendInvitations($scope.loggedInUser._id)
    .$promise.then(
      function(response){
        $scope.friendInvitations = response.data;
        console.log("friend invitations::"+JSON.stringify(response.data));
      }).catch(
        function(error){
          $log.warn(error);
        });
      }

  $scope.accept = function(user){
    meetupApiService.addFriend($scope.loggedInUser._id, user._id)
    .$promise.then(function(response){
      $scope.getFriends();
      $scope.getInvitations();
    }).catch(function(error){
      $log.error(error);
    })
  }

  $scope.showModal = function(){
    $("#editMeetupModal").modal('show');
  }

  $scope.parseDate = function(date){
    return new Date( Date.parse( date ) );
  }

  $interval(function(){
    $scope.getMeetups();
  }, 5000);

  $scope.getMeetups();
  $scope.updateLocation();
  $scope.getInvitations()
});
