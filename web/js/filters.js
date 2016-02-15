'use strict';

myApp.filter('coordinateFilter', function(){
  return function(coordinate){
    if(!coordinate.trim()){
      return 0;
    }
  }
});
