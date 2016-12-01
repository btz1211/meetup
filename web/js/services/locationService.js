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
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
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
