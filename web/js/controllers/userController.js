'use strict'

myApp.controller('userCtrl', function($scope, $cookies, $routeParams, $log, alertService, meetupApiService){
    $scope.loggedInUser = $cookies.getObject('loggedInUser');
    $scope.addable = false;
    $scope.user = {};

    $scope.getUser = function(){
      meetupApiService.getUserById($routeParams.userId).
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
        console.log('users are friends');
        $scope.addable = $.isEmptyObject(response.data) && userId != $scope.loggedInUser._id;
        return;
      }).catch(function(error){
        $scope.addable = error.status == 404 && userId != $scope.loggedInUser._id;
      });
      $scope.addable = false;
    }

    $scope.addFriend = function(){
      meetupApiService.addFriend($scope.loggedInUser._id, $scope.user._id)
      .$promise.then(
        function(response){
          $scope.setUserAddableAttribute($scope.user._id);
          alertService.addAlert(alertService.alertType.SUCCESS, "friend request sent")
        }
      ).catch(
        function(error){
          alertService.addAlert(alertService.alertType.ERROR, "friend request did not send, due to::" + error)
          $log.warn(error);
        }
      )
    }

    $scope.getUser();
});
