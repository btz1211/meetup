'use strict'

myApp.directive('inviteFriendsModal', function(){
  return{
    restrict: 'E',
    replace: true,
    scope:{
      meetup:"=",
      user:"=",
      getMeetupers:"&"
    },
    templateUrl: 'templates/directive-templates/invite-friends-modal.html',
    controller:function($scope, $log, meetupApiService){
      $scope.friends = [];
      $scope.selectedFriends = {};

      $scope.getFriends = function(){
        //getting the last user in the friends array
        //necessary for fast paging in mongodb
        var friendCount = $scope.friends.length;
        var lastUserId = friendCount > 0 ? $scope.friends[friendCount - 1]._id : null;

        meetupApiService.getFriends($scope.user._id, lastUserId, 1)
        .$promise.then(function(response){
          console.log('next batch of friends:' + JSON.stringify(response.data));
          $scope.friends = response.data;
        }).catch(function(error){
          $log.warn(error);
        });
      }

      $scope.searchFriends = function(searchString){
        return meetupApiService.searchFriends($scope.user._id, searchString)
        .$promise.then(function(response){
          return response.data.map(function(user){
            user.fullName = user.firstName + ' ' + user.lastName;
            return user;
          })
        }).catch(function(error){
          $log.warn(error);
        });
      }

      $scope.addMeetupers = function(){
        var promises = [];
        Object.keys($scope.selectedFriends).forEach(function(friend){
          promises.push(meetupApiService.addMeetuper($scope.meetup._id, friend).$promise);
        });

        Promise.all(promises)
        .then(function(){
          $scope.getMeetupers();
        }).catch(function(error){
          $log.warn(error);
        })
      }

      $scope.onFriendSelect = function(item, model, label){
        $log.info("item:"+JSON.stringify(item) + ":"+JSON.stringify(model) + ":"+JSON.stringify(label));

        if(!$scope.isFriendSelected(item)){
          $scope.selectedFriends[item._id] = item;
        }

        if($scope.searchString){
          $scope.searchString = "";
        }
      }

      $scope.isFriendSelected = function(friend){
        return $scope.selectedFriends.hasOwnProperty(friend._id);
      }

      $scope.getNumberOfSelectedFriends = function(){
        return Object.keys($scope.selectedFriends).length;
      }

      $scope.getFriends();
    }
  }
});
