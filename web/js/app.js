var myApp = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies'])
.config(function($routeProvider){
  $routeProvider
    .when('/login',{
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    }).when('/meetups', {
      templateUrl: 'templates/meetups.html',
      controller: 'meetupsCtrl'
    }).when('/meetup/new', {
        templateUrl: 'templates/editMeetup.html',
        controller: 'editMeetupCtrl'
    }).when('/meetup/:meetupId',{
      templateUrl: 'templates/meetup.html',
      controller: 'meetupCtrl'

    }).otherwise({redirectTo:'/login'});
});
