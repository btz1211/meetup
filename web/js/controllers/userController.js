'use strict'

myApp.controller('userCtrl', function($scope, $cookies, $routeParams, $log, meetupApiService){
    $scope.loggedInUser = $cookies.getObject('loggedInUser');
    $scope.addable = false;
    $scope.user = {};

    $scope.getUser = function(){
      meetupApiService.getUser($routeParams.userId).
      $promise.then(function(response){
        if(response.data){
          $scope.user = response.data;
          $scope.addable = $scope.isUserAddable($scope.user._id);
        }
      }).catch(function(error){
        $log.warn(error);
      });
    }

    $scope.isUserAddable = function(userId){
      meetupApiService.getFriend($scope.loggedInUser._id, '57bcf738d0aea49437668f5d')
      .$promise.then(function(response){
        if(userId != $scope.loggedInUser._id){
          return true;
        }
      }).catch(function(error){
        $log.warn('failed to verify if user is a friend')
      });

      return false;
    }

    $scope.addFriend = function(){
      meetupApiService.addFriend($scope.loggedInUser._id, $scope.user._id)
      .$promise.then(
        function(response){
          //warn user
        }
      ).catch(
        function(error){
          //warn user
          $log.warn(error);
        }
      )
    }

    $scope.getUser();
});
