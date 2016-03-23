'use strict';

window.app = angular.module('quickApp', ['ui.router']);

app.config(function($urlRouterProvider, $stateProvider){
    $stateProvider
        .state('map',{
            url:'/',
            templateUrl: '/app/map.html',
            controller: 'MapCtrl'
        });
    $stateProvider
        .state('customerDetail',{
            url: '/:id',
            templateUrl: '/app/customer.detail.html',
            controller: 'CustomerDetailController',
            resolve: {
                customer: function(CustomerFactory, $stateParams){
                    return CustomerFactory.getCustomer($stateParams.id);
                }
            }
        });

    $urlRouterProvider.otherwise('/');

});