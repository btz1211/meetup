'use strict';

myApp.controller('meetupsCtrl', function($scope, $log, $window, $cookies, mapService, meetupApiService){
  $scope.selectedMeetup = "";
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.meetup = {};
  $scope.currentLocation = {};
  $scope.mapModal = $("#createMeetupModal");

  $scope.marker;
  $scope.currentLocation= {};
  $scope.defaultLatitude = 40;
  $scope.defaultLongitude = -95;
  $scope.defaultZoom = 4;
  $scope.mapElement = document.getElementById('modal-map');
  $scope.map = mapService.getMap($scope.mapElement, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);

  $scope.getMeetups = function(){
    meetupApiService.getMeetups($scope.loggedInUser._id).
    $promise.then(
      function(response){
        $scope.meetups = response.data;
        console.log(response);
      }).catch(
        function(error){
          $log.warn(error);
    });
  }

  $scope.editMeetup = function(meetup){
    //update meetup
    $scope.meetup = meetup;
    $scope.showModal(function(){
      if($scope.marker){
        mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
      }else{
        $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
      }
      mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);
    });
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

  $scope.showMeetupInfo = function(meetup){
    console.log('meetup::' + meetup._id);
    $window.location.href = '#/meetup/' + meetup._id;
  }


  $scope.saveMeetup = function(){
     $scope.meetup.owner = $scope.loggedInUser._id;
     meetupApiService.saveMeetup($scope.meetup).
     $promise.then(function(response){
       console.log(JSON.stringify(response));
       $scope.getMeetups();
     }
   ).catch(function(error){
     $log.warn(error);
   });
  }

  $scope.useCurrentAddress = function(){
     navigator.geolocation.getCurrentPosition(function(position, error){

       console.log('position received::' + position.coords);
       $scope.meetup.latitude = position.coords.latitude;
       $scope.meetup.longitude = position.coords.longitude;

       //get location address
       mapService.getAddress({lat: $scope.meetup.latitude, lng:$scope.meetup.longitude}, function(address){
         if(address){
           $scope.meetup.address = address;
           $scope.$apply();

           if($scope.marker){
             $scope.marker.setPosition({lat:$scope.meetup.latitude, lng:$scope.meetup.longitude});
           }else{
             $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.meetup.name);
           }
           mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);
         }
       });
     });
   }

   $scope.updatePosition = function(){
     $scope.meetup.latitude = null;
     $scope.meetup.longitude = null;

     mapService.getLocation($scope.meetup.address, function(position){
       $scope.meetup.latitude = position.lat();
       $scope.meetup.longitude = position.lng();

       if($scope.marker){
         $scope.marker.setPosition(position);
       }else{
         $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
       }
       mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);

     });
   }

  $scope.updateLocation = function(){
    navigator.geolocation.getCurrentPosition(function(position, error){
      console.log('position received::' + JSON.stringify(position.coords));
      meetupApiService.updateLocation($scope.loggedInUser._id, position.coords);
    });
  }

  $scope.showModal = function(callback){
    $scope.mapModal.modal('show');
    $scope.mapModal.on('shown.bs.modal', callback);
    $scope.mapModal.on('hidden.bs.modal', function(){
      $scope.mapModal.unbind();
    });
  }

  $scope.getMeetups();
  $scope.updateLocation();
});
