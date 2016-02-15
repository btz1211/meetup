'use strict';

/*controller for creating a new meetup*/
myApp.controller('newMeetupCtrl', function($scope, $log, meetupApiService){
  $scope.saveMeetup = function(meetup){
    meetupApiService.saveMeetup(meetup).
    $promise.then(
      function(response){
        console.log(JSON.stringify(response));
      }
    ).catch(
      function(error){
        $log.warn(error);
      }
    )
  };
});

/*controller for the main meetup page*/
myApp.controller('meetupCtrl', function($scope, $log, $window, $cookieStore, meetupApiService){
  $scope.selectedMeetup = "";
  $scope.loggedInUser = $cookieStore.get('loggedInUser');

  meetupApiService.getMeetups($scope.loggedInUser._id).
  $promise.then(
    function(response){
      $scope.meetups = response.data;
      console.log(response);
  }).catch(
    function(error){
      $log.warn(error);
  });

  $scope.toggleMeetupInfo = function(meetup){
    if($scope.selectedMeetup === meetup){
      $scope.selectedMeetup = "";
    }else{
      $scope.selectedMeetup = meetup;
    }
  }

  $scope.isSelectedMeetup = function(meetup){
    return $scope.selectedMeetup === meetup;
  }
});

/*controller for the login page*/
myApp.controller('loginCtrl', function($scope, $window, $log, $cookieStore, meetupApiService){
  $scope.isNewUser = false;
  $scope.errors;
  $scope.user = {};

  $scope.authenticate = function(user){
    var result;
    if($scope.isNewUser){
      result = meetupApiService.createUser(user);
    }else{
      result = meetupApiService.authenticateUser(user)
    }

    result.$promise.then(
      function(response){
        $log.info(response);
        $cookieStore.put('loggedInUser', response.data);
        //sharedDataService.setLoggedInUser();
        $window.location.href = '#/viewMeetups';
      }
    ).catch(
      function(error){
          $log.warn(error);
          $scope.errors = error.data.errors;
      }
    );
  };
  $scope.cancelSignUp = function(){
    $scope.isNewUser = false;
    $scope.errors = null;
  }

});
