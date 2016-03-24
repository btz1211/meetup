'use strict';

myApp.controller('editMeetupCtrl', function($scope, $log, $window, $cookies, meetupApiService, mapService){
  $scope.meetup = {};
  $scope.currentLocation = {};
  $scope.mapElement = document.getElementById('map');
  $scope.map = mapService.getMap($scope.mapElement);
  $scope.marker;
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.selectedFriend;
  $scope.friends = ['Terry', 'Maggie'];
  $scope.selectedFriends = [];

  $scope.saveMeetup = function(){
    $scope.meetup.owner = $scope.loggedInUser._id;
    meetupApiService.saveMeetup($scope.meetup).
    $promise.then(
      function(response){
        console.log(JSON.stringify(response));
        $window.location.href= '#/meetups';
      }
    ).catch(
      function(error){
        $log.warn(error);
      }
    )
  };

  $scope.cancel = function(){
    $window.location.href= '#/meetups';
  }

  $scope.useCurrentAddress = function(){
    var permissions = navigator.permissions;
    navigator.geolocation.getCurrentPosition(function(position, error){

      console.log('position received::' + position.coords);
      $scope.meetup.latitude = position.coords.latitude;
      $scope.meetup.longitude = position.coords.longitude;

      //get location address
      mapService.getAddress({lat: $scope.meetup.latitude, lng:$scope.meetup.longitude}, function(address){
          if(address){
            $scope.meetup.address = address;
            $scope.$apply();

            mapService.zoomIn($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, 14);
            if($scope.marker){
              $scope.marker.setPosition({lat:$scope.meetup.latitude, lng:$scope.meetup.longitude});
            }else{
              $scope.marker = mapService.addMarker($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, $scope.currentLocation.address);
            }          }
        });
    });
  };

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
      mapService.zoomIn($scope.map, $scope.meetup.latitude, $scope.meetup.longitude, 14);
      $scope.$apply();
    });
  }

  $scope.searchFriends = function(){
    return [{"username":"alpha", "firstName":"Terry", "lastName":"Zheng"},
            {"username":"beta", "firstName":"Maggie", "lastName":"Jiang"}];
  }

});
