myApp.controller('friendsCtrl', function($scope, $cookies, $window, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.friends = [];
  $scope.friendRequests = [];
  $scope.friendInvitations = [];

  $scope.addFriend = function(){
      $window.location.href = '#/friends/add';
  }

  $scope.getFriends = function(){
    meetupApiService.getFriends($scope.loggedInUser._id).
    $promise.then(
      function(response){
        $scope.friends = response.data;
        console.log("friends::"+JSON.stringify(response.data));
    }).catch(
      function(error){
        $log.warn(error);
    });
  }

  $scope.getRequests = function(){
    meetupApiService.getFriendRequests($scope.loggedInUser._id).
    $promise.then(
      function(response){
        $scope.friendRequests = response.data;
        console.log("friend requests::"+JSON.stringify(response.data));
    }).catch(
      function(error){
        $log.warn(error);
    });
  }

  $scope.getInvitations = function(){
    meetupApiService.getFriendInvitations($scope.loggedInUser._id).
    $promise.then(
      function(response){
        $scope.friendInvitations = response.data;
        console.log("friend invitations::"+JSON.stringify(response.data));
    }).catch(
      function(error){
        $log.warn(error);
    });
  }

  $scope.accept = function(user){
    meetupApiService.addFriend($scope.loggedInUser._id, user._id)
    .$promise.then(function(response){
      $scope.getFriends();
      $scope.getInvitations();
    }).catch(function(error){
      $log.error(error);
    })
  }

  $scope.getFriends();
  $scope.getRequests();
  $scope.getInvitations();
})
