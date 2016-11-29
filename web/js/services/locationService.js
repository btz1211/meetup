'use strict';

myApp.factory('locationService', function(socketService){
  var locationWatchId = {};

  return {
    start: function(user){

      var onLocationUpdate = function(position){
        socketService.emit('locationUpdate', { user: user,
          latitude: position.coords.latitude, longitude: position.coords.longitude });
      }

      var onLocationUpdateError = function(error){
        console.warn('ERROR(' + error.code + '): ' + error.message);
      }

      var locationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      locationWatchId = navigator.geolocation.watchPosition(onLocationUpdate, onLocationUpdateError, locationOptions);
    },

    stop: function(){
      if(locationWatchId){
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
