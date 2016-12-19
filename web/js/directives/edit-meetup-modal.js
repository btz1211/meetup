'use strict'

myApp.directive('editMeetupModal', function(){
  return{
    restrict: 'E',
    replace: true,
    scope:{
      meetup:"="
    },
    templateUrl: 'templates/directive-templates/edit-meetup-modal.html',
    controller: function($scope, $cookies, $log, mapService, meetupApiService){
      $scope.marker;
      $scope.defaultLatitude = 40;
      $scope.defaultLongitude = -95;
      $scope.defaultZoom = 4;
      $scope.mapElement = document.getElementById('modal-map');
      $scope.map = mapService.getMap($scope.mapElement, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);
      $scope.loggedInUser = $cookies.getObject('loggedInUser');
      $scope.startTimePicker;
      $scope.endTimePicker;

      $scope.saveMeetup = function(){
        //update/save meetup
        var saveMeetupPromise;
        if($scope.meetup._id){
          saveMeetupPromise = meetupApiService.updateMeetup($scope.meetup).$promise;
        }else{
          $scope.meetup.owner = $scope.loggedInUser._id;
          saveMeetupPromise = meetupApiService.saveMeetup($scope.meetup).$promise;
        }

        saveMeetupPromise.then(function(response){
          $log.warn(JSON.stringify(response));
        }).catch(function(error){
          $log.warn(error);
        });
      }

      $scope.useCurrentAddress = function(){
         navigator.geolocation.getCurrentPosition(function(position, error){

           console.log('position received::' + position.coords);
           $scope.meetup.latitude = position.coords.latitude;
           $scope.meetup.longitude = position.coords.longitude;

           //get location address
           mapService.getAddress({lat: $scope.meetup.latitude, lng:$scope.meetup.longitude}, function(address){
             if(address){
               $scope.meetup.address = address;
               $scope.$apply();
               $scope.moveMarker($scope.meetup.latitude, $scope.meetup.longitude, 14, address);
             }
           });
         });
       }

       $scope.updatePosition = function(){
         $scope.meetup.latitude = null;
         $scope.meetup.longitude = null;

         mapService.getLocation($scope.meetup.address, function(position){
           $scope.meetup.latitude = position.lat();
           $scope.meetup.longitude = position.lng();
           $scope.moveMarker($scope.meetup.latitude, $scope.meetup.longitude, 14, $scope.meetup.address);
         });
       }

       $scope.onModalShow = function(){
         mapService.removeMarkerFromMap($scope.marker);

         if(! jQuery.isEmptyObject($scope.meetup)){
           $scope.moveMarker($scope.meetup.latitude, $scope.meetup.longitude, 14, $scope.meetup.address);

           //set start time and end time
           $scope.startTimePicker.date(moment($scope.meetup.startTime).format('MM/DD/YYYY h:mm A'));
           $scope.endTimePicker.date(moment($scope.meetup.endTime).format('MM/DD/YYYY h:mm A'));

         }else{
           mapService.zoomIn($scope.map, $scope.defaultLatitude, $scope.defaultLongitude, $scope.defaultZoom);

           //set start time and end time to current time
           $scope.startTimePicker.date(moment());
           $scope.endTimePicker.date(moment());
         }
       }

       $scope.setupModal = function(){
         $("#edit-meetup-modal").on('shown.bs.modal', $scope.onModalShow);
       }

       $scope.setupDateTimePickers = function(){
         //set on change event listeners
         $('#startTimePicker').datetimepicker().on('dp.change', function(update){
           if(update){
             $scope.meetup.startTime = update.date.format('MM/DD/YYYY h:mm A');
           }
         });
         $('#endTimePicker').datetimepicker().on('dp.change', function(update){
           if(update){
             $scope.meetup.endTime = update.date.format('MM/DD/YYYY h:mm A');
           }
         });

         $scope.startTimePicker = $('#startTimePicker').datetimepicker().data("DateTimePicker");
         $scope.endTimePicker = $('#endTimePicker').datetimepicker().data("DateTimePicker");
       }

       $scope.moveMarker = function(lat, lng, zoom, title){
         if($scope.marker){
           mapService.removeMarkerFromMap($scope.marker);
         }
         $scope.marker = mapService.addMarker($scope.map, lat, lng, title);
         mapService.zoomInOnMarker($scope.map, $scope.marker, zoom);
       }

       $scope.setupModal();
       $scope.setupDateTimePickers();
    }
  }
});

myApp.directive('endTimeValidation', function(){
  return{
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      function endTimeValidation(value) {
        var endMoment = moment(scope.meetup.endTime);
        var valid = endMoment.isValid() && endMoment.isAfter(moment())

        //set validity for elements
        ctrl.$setValidity('end-time', valid);
        scope.meetupForm.endTime.$setValidity('end-time', valid)

        return value
      }
      ctrl.$parsers.push(endTimeValidation);
      ctrl.$formatters.push(endTimeValidation);
    }
  }
});

//custom validation for start time
myApp.directive('meetupTimeValidation', function(){
  return{
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      function meetupTimeValidation(value) {
        var startMoment = moment(scope.meetup.startTime);
        var valid = startMoment.isValid() && startMoment.isBefore(scope.meetup.endTime)

        //set validity for elements
        ctrl.$setValidity('meetup-time', valid);
        scope.meetupForm.startTime.$setValidity('meetup-time', valid)
        scope.meetupForm.endTime.$setValidity('meetup-time', valid)

        return value
      }
      ctrl.$parsers.push(meetupTimeValidation);
      ctrl.$formatters.push(meetupTimeValidation);
    }
  }
});
