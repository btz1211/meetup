var myApp = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies', 'ngAnimate', 'ui.bootstrap'])
.config(function($routeProvider){
  $routeProvider
    .when('/login',{
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    }).when('/meetups', {
      templateUrl: 'templates/meetups.html',
      controller: 'meetupsCtrl'
<<<<<<< HEAD
    }).when('/meetup/new', {
        templateUrl: 'templates/editMeetup.html',
        controller: 'editMeetupCtrl'
    }).when('/meetup/:meetupId',{
      templateUrl: 'templates/meetup.html',
      controller: 'meetupCtrl'

=======
    }).when('/meetup/new',{
      templateUrl: 'templates/editMeetup.html',
      controller: 'editMeetupCtrl'
    }).when('/meetup/:meetupId',{
      templateUrl: 'templates/meetup.html',
      controller: 'meetupCtrl'
    }).when('/friends',{
      templateUrl: 'templates/friends.html',
      controller: 'friendsCtrl'
    }).when('/friends/add',{
      templateUrl: 'templates/addFriend.html',
      controller: 'addFriendCtrl'
>>>>>>> home
    }).otherwise({redirectTo:'/login'});
});
