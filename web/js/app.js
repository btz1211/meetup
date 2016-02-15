var myApp = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies'])
.config(function($routeProvider){
  $routeProvider
    .when('/login',{
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    }).when('/viewMeetups', {
      templateUrl: 'templates/meetups.html',
      controller: 'meetupCtrl'
    }).otherwise({redirectTo:'/login'});
});
