'use strict';

window.app = angular.module('quickApp', ['ui.router', 'esri.map']);

app.config(function($urlRouterProvider, $stateProvider){
    $stateProvider
        .state('map',{
            url:'/',
            templateUrl: '/app/map.html',
            controller: 'MapCtrl'
        });

    $urlRouterProvider.otherwise('/');

});