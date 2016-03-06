myApp.controller('friendsCtrl', function($scope, $cookies, meetupApiService){
  $scope.loggedInUser = $cookies.getObject('loggedInUser');
  $scope.friends = [];

  meetupApiService.getFriends($scope.loggedInUser._id).
  $promise.then(
    function(response){
      $scope.friends = response.data;
      console.log(response);
  }).catch(
    function(error){
      $log.warn(error);
  });
})
