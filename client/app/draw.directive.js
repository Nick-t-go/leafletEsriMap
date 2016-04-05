app.directive('draw', function () {

    return {
        restrict: 'E',
        templateUrl: '/app/draw.directive.html',
        scope: {map: "="},
        controller: 'DrawCtrl'
    };

});