'use strict';

myApp.factory('locationService', function(socketService){
  var locationWatchId = {};

  return {
    start: function(user){

      var onLocationUpdate = function(position){
        alert("location update received from navigator: ["
            +  position.coords.latitude + "," + position.coords.longitude + "]");

        socketService.emit('locationUpdate', { user: user,
          latitude: position.coords.latitude, longitude: position.coords.longitude });
      }

      var onLocationUpdateError = function(error){
        console.warn('ERROR(' + error.code + '): ' + error.message);
      }

      var locationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 5000
      };

      locationWatchId = navigator.geolocation.watchPosition(onLocationUpdate, onLocationUpdateError, locationOptions);
    },

    stop: function(){
      if(locationWatchId){
        console.log('location watch has been stopped');
        navigator.geolocation.clearWatch(locationWatchId);
      }
    },

    getCurrentPosition: function(callback){
      navigator.geolocation.getCurrentPosition(callback, function(error){
        console.warn('ERROR(' + err.code + '): ' + err.message);
      });
    }
  }
});
