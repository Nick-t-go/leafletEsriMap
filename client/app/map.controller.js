/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope, Auth ){

  $scope.displayInfo = false;
  $scope.selectedFeatures = [];

  $scope.activateContracts = function(){
    $scope.displayInfo = !$scope.displayInfo;
  }

    $scope.user = {};

    var map = L.map('map').setView([40.792240, -73.138260], 12);

    L.esri.basemapLayer('Topographic').addTo(map);

    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'),{ toggleDisplay: true}).addTo(map);
    $scope.data = "Hey There";
    function serverAuth(callback){
       L.esri.post('https://fs-gdb10:6443/arcgis/tokens/generateToken', {
         username: 'ntoscano',
         password: '**********',
         f: 'json',
         expiration: 86400,
         client: 'referer',
         referer: window.location.origin
       }, callback);
     }

     serverAuth(function(error, response){
     	console.log
       var dl = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SuffolkCountySewers/MapServer/16',
         opacity: 1,
         token:  response.token,
         style: function(feature){
         	console.l
           return {color:'#FF4500', weight: 2}}
       }).addTo(map);

       dl.on('authenticationrequired', function (e) {
         serverAuth(function(error, response){
           e.authenticate(response.token);
         });
       });
       var query = L.esri.Related.query(dl);

       //wire up event listener to fire query when users click on a feature
       dl.on("click", queryRelated);

       function queryRelated (evt) {
        dl.query().nearby(evt.latlng,1).ids(function(error, ids){
          console.log(ids)}))
        //if multiple ids let user click one polygon
        //else run function that returns records
        if($scope.displayInfo)
          //show records
          //then have user select record to display particular record 
         query.objectIds([evt.layer.feature.id]).relationshipId(6).run(function(error, response, raw) {
         	console.log(response.features)
           $scope.data = response.features[0].properties;
           $scope.$digest()
         })
       }


     });



})