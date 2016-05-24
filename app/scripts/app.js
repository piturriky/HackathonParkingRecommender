'use strict';

/**
 * @ngdoc overview
 * @name hackathonApp
 * @description
 * # hackathonApp
 *
 * Main module of the application.
 */
angular
  .module('hackathonApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router'
  ])
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', { //home
        url: '/',
        templateUrl: 'views/main.html',
        controller: 'main'
      });
  })
.run(['$state', function($state) {
  $state.go('home');
}]);
