'use strict';

myApp.controller('newMeetupCtrl', function($scope, $log, meetupApiService){
  $scope.saveMeetup = function(meetup){
    meetupApiService.saveMeetup(meetup).
    $promise.then(
      function(response){
        console.log(JSON.stringify(response));
      }
    ).catch(
      function(error){
        $log.warn(error);
      }
    )
  };
});
