'use strict';

myApp.factory('mapService', function($log){
  var geocoder = new google.maps.Geocoder;

  return {
    getMap: function(mapElement, lat, lng, zoom){
      if(!lat || !lng){ lat = 37.09024, lng = -95.712891 }
      if(!zoom){zoom = 4 }

      return new google.maps.Map(mapElement, {
        zoom: zoom,
        center: new google.maps.LatLng(lat, lng)
      });
    },

    getAddress: function(location, callback){
      geocoder.geocode({"location":location}, function(results, status){
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            callback(results[1].formatted_address);
            return;
          }
        }
        callback();
      });
    },

    getLocation:function(address, callback){
      geocoder.geocode({"address":address}, function(results, status){
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            callback(results[0].geometry.location);
            return;
          }
        }
        callback();
      });
    },
    addMarker : function(map, lat, lng, title, content){
      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(lat, lng),
        title: title,
        content: content,
      });

      return marker;
    },

    zoomIn: function(map, lat, lng, zoom){
      var center = new google.maps.LatLng(lat, lng);

      map.setZoom(zoom);
      map.panTo(center);
    }
    /*
    getMeetupMap: function(meetup, mapElement){
      var meetupMap = {};

      meetupMap.map =

      /*mark meetup location on the map
      meetupMap.marker = createMarker(meetupMap.map, meetup.latitude, meetup.longitude, meetup.address, meetup.address);
      meetupMap.infoWindow = new google.maps.InfoWindow();

      google.maps.event.addListener(meetupMap.marker, 'click', function(){
        meetupMap.infoWindow.setContent('<h5>'+ meetup.name +'</h5>');
        meetupMap.infoWindow.open(meetupMap.map, meetupMap.marker);
      });

      /*mark meetupers on the map
      if(meetup.meetupers){
        for(var i = 0; i < meetup.meetupers.length; ++i){
          var meetuper = meetup.meetupers[i].user;
          if(meetuper.lastKnownLatitude && meetuper.lastKnownLongitude){
            meetupMap.meetupMarker[meetuper.userId]= createMarker(meetupMap.map,meetuper.lastKnownLatitude, meetuper.lastKnownLongitude, meetuper.lastName + ',' + meetuper.firstName);
          }
        }
      }

      return meetupMap;
    }
    */
  }
});
