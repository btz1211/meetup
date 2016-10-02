'use strict';

myApp.factory('mapService', function($log){
  var geocoder = new google.maps.Geocoder;

  return {
    getMap: function(mapElement, lat, lng, zoom){
      var map = new google.maps.Map(mapElement, {
        zoom: zoom,
        center: new google.maps.LatLng(lat, lng)
      });

      return map;
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
    addMarker : function(map, lat, lng, title, content, imageUrl){
      var markerImage = null;
      if(imageUrl){
        markerImage = new google.maps.MarkerImage(
          imageUrl,
          new google.maps.Size(35,35),
          new google.maps.Point(0, 0),
          new google.maps.Point(17, 17),
          new google.maps.Size(35,35)
        );
      }

      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(lat, lng),
        title: title,
        content: content,
        icon: markerImage
      });

      var infoWindow = new google.maps.InfoWindow({
                content: title,
                maxWidth: 200
              });

      marker.addListener('click', function(){
        infoWindow.open(map, marker);
      });

      return marker;
    },

    moveMarker : function(marker, lat, lng){
      marker.setPosition(new google.maps.LatLng(lat, lng));
    },

    removeMarkerFromMap : function(marker){
      marker.setMap(null);
    },

    zoomIn: function(map, lat, lng, zoom){
      google.maps.event.trigger(map, 'resize');
      if(!zoom){
        zoom = map.getZoom();
      }
      var center = new google.maps.LatLng(lat, lng);
      map.setZoom(zoom);
      map.panTo(center);
      map.setCenter(center);
    },
  }
});
