var myApp = angular.module('myApp', ['ngResource', 'ngRoute', 'ngCookies', 'ngAnimate', 'ngMessages', 'ui.bootstrap'])
.config(function($routeProvider){
  $routeProvider
    .when('/login',{
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl',
      resolve:{
        "check":function($location, $cookies){
          if($cookies.getObject('loggedInUser')){
            $location.path('/meetups')
          }
        }
      }
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
}).run(function($rootScope, $cookies, $location){
  $rootScope.$on('$routeChangeStart', function (event) {
    if(! $cookies.getObject('loggedInUser')){
       $location.path('/login')
     }
   });
});
