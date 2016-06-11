'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, $route, mapService, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.mapModal = $("#editMeetupModal");

  //meetup vars
  $scope.meetup = {};
  $scope.selectedMeetup = "";
  $scope.currentLocation = {};

  //friends/user vars
  $scope.friendInvitations = [];

/*
  //map vars
  $scope.marker;
  $scope.currentLocation= {};
  $scope.defaultLatitude = 40;
  $scope.defaultLongitude = -95;
  $scope.defaultZoom = 4;
  $scope.mapElement = document.getElementById('modal-map');
  $scope.map = mapService.getMap($scope.mapElement, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);
*/

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
/*
    //update meetup
    $scope.showModal(function(){
      if($scope.marker){
        mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
      }else{
        $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
      }
      mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);
    });
    */
  }

  $scope.newMeetup = function(){
    $scope.meetup = {};
    //reset marker
    if($scope.marker){
      $scope.marker.setMap(null);
      $scope.marker = null;
    }
    $scope.showModal(function(){
      mapService.zoomIn($scope.map, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);
    });
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

  $scope.onModalShow = function(){
    if(jQuery.isEmptyObject($scope.meetup)){
      if($scope.marker){
        mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
      }else{
        $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
      }
    }
    mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);
  }



  $scope.showModal = function(callback){
    //the reason for the callback is due to a race condition between map
    //rendering and modal generation. In order for map to calculate the size
    //modal needs to appear first
    $scope.mapModal.modal('show');
    $scope.mapModal.on('shown.bs.modal', $scope.onModalShow);
    $scope.mapModal.on('hidden.bs.modal', function(){
      $scope.mapModal.unbind();
    });
  }



  $scope.parseDate = function(date){
    return new Date( Date.parse( date ) );
  }

  $scope.getMeetups();
  $scope.updateLocation();
  $scope.getInvitations()
});
