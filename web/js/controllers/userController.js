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
          $scope.setUserAddableAttribute($scope.user._id);
        }
      }).catch(function(error){
        $log.warn(error);
      });
    }

    $scope.setUserAddableAttribute = function(userId){
      meetupApiService.getFriend($scope.loggedInUser._id, userId)
      .$promise.then(function(response){
        console.log('response:' + JSON.stringify(response));
        $scope.addable = $.isEmptyObject(response.data) && userId != $scope.loggedInUser._id;
        return;
      }).catch(function(error){
        $log.error(JSON.stringify(error));
        $log.warn('failed to verify if user is a friend');
      });
      $scope.addable = false;
    }

    $scope.addFriend = function(){
      meetupApiService.addFriend($scope.loggedInUser._id, $scope.user._id)
      .$promise.then(
        function(response){
          $scope.setUserAddableAttribute($scope.user._id);
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
