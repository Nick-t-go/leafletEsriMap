/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope, Auth ){

    $scope.user = {};

    var map = L.map('map').setView([34.326, -117.697], 12);

    L.esri.basemapLayer('Topographic').addTo(map);

    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'),{ toggleDisplay: true}).addTo(map);



})