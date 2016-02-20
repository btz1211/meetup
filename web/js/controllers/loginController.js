'use strict';

myApp.controller('loginCtrl', function($scope, $window, $log, $cookies, meetupApiService){
  $scope.isNewUser = false;
  $scope.errors;
  $scope.user = {};

  $scope.authenticate = function(user){
    var result;
    if($scope.isNewUser){
      result = meetupApiService.createUser(user);
    }else{
      result = meetupApiService.authenticateUser(user)
    }

    result.$promise.then(
      function(response){
        $log.info(response);
        $cookies.putObject('loggedInUser', response.data);
        //sharedDataService.setLoggedInUser();
        $window.location.href = '#/meetups';
      }
    ).catch(
      function(error){
          $log.warn(error);
          $scope.errors = error.data.errors;
      }
    );
  };
  $scope.cancelSignUp = function(){
    $scope.isNewUser = false;
    $scope.errors = null;
  }

});
