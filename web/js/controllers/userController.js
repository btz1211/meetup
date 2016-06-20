'use strict'

myApp.controller('userCtrl', function($scope, $cookies, $routeParams, $log, meetupApiService){
    $scope.loggedInUser = $cookies.getObject('loggedInUser');

    $scope.user = {};

    $scope.getUser = function(){
      meetupApiService.getUser($routeParams.userId).
      $promise.then(
        function(response){
          if(response.data){
            $scope.user = response.data;
          }
        }).catch(
          function(error){
            $log.warn(error);
      });
    }


    $scope.getUser();
})
