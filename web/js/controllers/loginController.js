'use strict';

myApp.controller('loginCtrl', function($scope, $location, $log, $cookies, alertService, meetupApiService){
  $scope.isNewUser = false;
  $scope.errors;
  $scope.user = {};

  $scope.checkUsername = function(){
    meetupApiService.getUserByUsername($scope.user.userId)
    .$promise.then(function(response){
      $log.warn("username is already taken");
    }).catch(function(error){
      if(error.status == 404){
      }
    });
  }

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
        $location.path('/meetups')
      }
    ).catch(
      function(error){
          $log.warn(error);
          $scope.errors = error.data.errors;
      }
    );
  };

  $scope.toggleSignUp = function(isSignUp){
    $scope.isNewUser = isSignUp;
    $scope.errors = null;
    $scope.user = {}
  }

  $scope.passwordUpdate = function(){
    var passwordRetype = $scope.signupForm["password-retype"];
    if(passwordRetype.$dirty){
      passwordRetype.$parsers[0]($scope.passwordRetype);
    }
  }
});

/*custom validation for username*/
myApp.directive('usernameValidation', function(meetupApiService){
  return{
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      function usernameValidation(value) {

        meetupApiService.getUserByUsername(value)
        .$promise.then(function(response){
          ctrl.$setValidity('username', false)
        }).catch(function(error){
          if(error.status == 404){
            ctrl.$setValidity('username', true)
          }
        });
        return value;
      }
      ctrl.$parsers.push(usernameValidation);
    }
  }
});

myApp.directive('passwordRetypeValidation', function(){
  return{
    require: 'ngModel',
    link: function(scope, element, attr, ctrl) {
      function passwordRetypeValidation(value) {
        ctrl.$setValidity('password-retype', scope.user.password === value);
        return value;
      }
      ctrl.$parsers.push(passwordRetypeValidation);
    }
  }
});
