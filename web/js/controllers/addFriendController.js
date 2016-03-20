myApp.controller('addFriendCtrl', function($scope, $log, $cookies, $window, meetupApiService){
  $scope.name="";
  $scope.users = [];
  $scope.loggedInUser = $cookies.getObject('loggedInUser');

  $scope.search = function(searchString){
    console.log("search string:" + searchString);

    if(searchString && searchString.trim()){
      meetupApiService.searchUsers(searchString)
      .$promise.then(function(response){
        $log.info(response);
        $scope.users = response.data;
      }).catch(function(error){
        $log.warn(error);
      });
    }else{
      $scope.users = [];
    }
  };

  $scope.addFriend = function(user){
    meetupApiService.addFriend($scope.loggedInUser._id, user._id)
    .$promise.then(function(response){
      $window.location.href = '#/friends';
    }).catch(function(error){
      $log.error(error);
    })
  }
})
