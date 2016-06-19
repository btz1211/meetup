'use strict'

myApp.directive('navbar', function($log, meetupApiService){
    return{
      restrict: 'E',
      replace: true,
      scope:{
        activeItem:"@",
      },
      templateUrl: 'templates/directive-templates/navbar.html',
      link:function(scope, element, attr){
        scope.searchUsers = function(searchString){
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
        scope.onSelect = function(item){
          if(scope.onDropDownSelect){
            scope.onDropdownSelect({item: item});
          }
          scope.searchString = "";
        }
      }
    }
})
