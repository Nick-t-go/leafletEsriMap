app.controller('WidgetCtrl', function($scope, esriLoader) {

    var map = $scope.map

    esriLoader.require([
        "esri/map",  "esri/dijit/Print"
      ], function(
        Map, Draw, Print
      ) {

         // print dijit
        $scope.printer = new Print({
          map: map,
          url: "https://fs-gdb10:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer"
        }, dom.byId("printButton"));
        $scope.printer.startup();
    });

    $scope.print = function(){
        console.log($scope.printer)
    }
    });