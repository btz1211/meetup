var myApp = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies', 'ngAnimate', 'ngMessages', 'ui.bootstrap'])
.config(function($routeProvider){
  $routeProvider
    .when('/login',{
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    }).when('/meetups', {
      templateUrl: 'templates/meetups.html',
      controller: 'meetupsCtrl'
    }).when('/meetup/:meetupId',{
      templateUrl: 'templates/meetup.html',
      controller: 'meetupCtrl'
    }).when('/user/:userId', {
      templateUrl: 'templates/user.html',
      controller: 'userCtrl'
    }).otherwise({redirectTo:'/login'});
});
