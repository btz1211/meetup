'use strict'

myApp.directive('navbar', function($log, meetupApiService){
    return{
      restrict: 'E',
      replace: true,
      scope:{
        activeItem:"@",
      },
      templateUrl: 'templates/directive-templates/navbar.html',
      controller: function($scope, $cookies, $window, meetupApiService){
        $scope.loggedInUser = $cookies.getObject('loggedInUser');

        $scope.searchUsers = function(searchString){
          return meetupApiService.searchUsers(searchString)
          .$promise.then(function(response){
            return response.data.map(function(user){
              user.fullName = user.firstName + ' ' + user.lastName;
              return user;
            })
          }).catch(function(error){
            $log.warn(error);
          });
        },
        $scope.onUserSelect = function(user){
          console.log('user::' + user);
          $window.location.href = '#/user/' + user._id;
        }
      }
    }
})
