myApp.controller('addFriendCtrl', function($scope, $log, meetupApiService){
  $scope.name="";
  $scope.users = [];

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
})
