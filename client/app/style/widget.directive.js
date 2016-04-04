app.directive('widgetEsri', function () {

    return {
        restrict: 'E',
        templateUrl: '/app/widget.directive.html',
        scope: {map: "="},
        controller: 'WidgetCtrl',
        link: function(scope, element, attrs){
      		console.log('test', scope.map)
    	}
    };

});