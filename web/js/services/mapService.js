'use strict';

myApp.factory('mapService', function($log){
  var createMarker = function(map, lat, lng, title, content){
    var marker = new google.maps.Marker({
      map: map,
      position: new google.maps.LatLng(lat, lng),
      title: title,
      content: content
    });

    return marker;
  }

  return {
    getMeetupMap: function(meetup, mapElement){
      var meetupMap = {};

      meetupMap.map = new google.maps.Map(mapElement, {
        zoom: 10,
        center: new google.maps.LatLng(meetup.latitude, meetup.longitude)
      });

      /*mark meetup location on the map*/
      meetupMap.marker = createMarker(meetupMap.map, meetup.latitude, meetup.longitude, meetup.address, meetup.address);
      meetupMap.infoWindow = new google.maps.InfoWindow();

      google.maps.event.addListener(meetupMap.marker, 'click', function(){
        meetupMap.infoWindow.setContent('<h5>'+ meetup.name +'</h5>');
        meetupMap.infoWindow.open(meetupMap.map, meetupMap.marker);

      });

      /*mark meetupers on the map
      for(var i = 0; i < meetup.meetupers.length; ++i){
        var meetuper = meetup.meetupers[i];
        if(meetuper.lastKnownLatitude && meetuper.lastKnownLongitude){}
          var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(meetuper.lastKnownLatitude, meetuper.lastKnownLongitude),
            title: meetuper.user.lastName + ', ' + meetuper.user.firstName
          });
        }
      }*/

      return meetupMap;
    }
  }
});
