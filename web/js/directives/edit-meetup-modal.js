'use strict'

myApp.directive('editMeetupModal', function(){
  return{
    restrict: 'E',
    replace: true,
    scope:{
      meetup:"="
    },
    templateUrl: 'templates/directive-templates/edit-meetup-modal.html',
    controller: function($scope, $cookies, mapService, meetupApiService){
      $scope.marker;
      $scope.currentLocation= {};
      $scope.defaultLatitude = 40;
      $scope.defaultLongitude = -95;
      $scope.defaultZoom = 4;
      $scope.mapElement = document.getElementById('modal-map');
      $scope.map = mapService.getMap($scope.mapElement, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);
      $scope.loggedInUser = $cookies.getObject('loggedInUser');

      $scope.saveMeetup = function(){
        //update/save meetup
        var saveMeetupPromise;
        if($scope.meetup._id){
          saveMeetupPromise = meetupApiService.updateMeetup($scope.meetup).$promise;
        }else{
          $scope.meetup.owner = $scope.loggedInUser._id;
          saveMeetupPromise = meetupApiService.saveMeetup($scope.meetup).$promise;
        }

        saveMeetupPromise.then(function(response){
          console.log(JSON.stringify(response));
          $scope.getMeetups();
          //$route.reload();
        }).catch(function(error){
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
                 mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
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
             mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
           }else{
             $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
           }
           mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);

         });
       }

       $scope.onModalShow = function(){
         if(! jQuery.isEmptyObject($scope.meetup)){
           //existing meetup, move marker to meetup location and zoom in
           if($scope.marker){
             mapService.moveMarker($scope.marker, $scope.meetup.latitude, $scope.meetup.longitude);
           }else{
             $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
           }
           mapService.zoomIn($scope.map,$scope.meetup.latitude, $scope.meetup.longitude, 14);
         }else{
           //new meetup, remove marker and reset map zoom
           if($scope.marker){
             mapService.removeMarkerFromMap($scope.marker);
             $scope.marker = null;
           }

           mapService.zoomIn($scope.map, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);
         }

       }

       $scope.setupModal = function(){
         $("#editMeetupModal").on('shown', $scope.onModalShow);
       }

       $scope.setupModal();
    }
  }
});
