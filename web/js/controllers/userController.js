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

    $scope.addable = function(){
      if($scope.user._id != $scope.loggedInUser._id){
        return true
      }
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
})
