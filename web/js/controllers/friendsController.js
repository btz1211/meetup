myApp.controller('friendsCtrl', function($scope, $cookies, $window, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.friends = [];

  meetupApiService.getFriends($scope.loggedInUser._id).
  $promise.then(
    function(response){
      $scope.friends = response.data;
      console.log(response.data);
  }).catch(
    function(error){
      $log.warn(error);
  });

  $scope.addFriend = function(){
      $window.location.href = '#/friends/add';
  }
})
