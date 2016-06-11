'use strict'

myApp.directive('meetupView', function(){
    return{
      restrict: 'E',
      replace: true,
      scope:{
        meetup:"="
      },
      templateUrl: 'templates/directive-templates/meetup-view.html'
    }
})
