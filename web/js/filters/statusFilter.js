'use strict';

myApp.filter('statusFilter', function(){
  return function(status){
    switch(status){
      case "INPROGRESS":
        return "in progress";
        break;
      case "COMPLETED":
        return "completed"
        break;
      case "CANCELLED":
        return "cancelled"
        break;
    }
  }
});
