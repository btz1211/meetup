'use strict';

myApp.factory('alertService', function($log, $compile){
  var template =
      "<div id='notification' class='alert alert-dismissible alert-#type'>"
      +"<button type='button' class='close' data-dismiss='alert'>&times;</button>"
      +"<h4>#message</h4>"
      +"</div>"
  var service = {}

  service.alertType = {
      WARNING: "warning",
      ERROR: "danger",
      INFO: "info",
      SUCCESS: "success"
  }

  service.addAlert = function(type, message){
    var nav = $("nav");

    //alert should always appear under the navbar
    if(nav){
      var notification = $("#notification");

      //remove existing one
      if(notification){ notification.remove(); }

      //show notification
      var element = template.replace("#type", type).replace("#message", message);
      nav.after(element);
    }
  }

  return service;
});
