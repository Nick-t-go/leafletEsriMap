app.directive('legend', function () {

    return {
        restrict: 'E',
        templateUrl: '/app/legend.directive.html',
        scope: false,
        resolve: function($scope){
        	$scope.digest()
        }
    };

});