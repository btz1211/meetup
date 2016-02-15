'use strict';

myApp.filter('coordinateFilter', function(){
  return function(coordinate){
    if(!coordinate){
      return 0;
    }
    return coordinate;
  }
});
