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
         password: "****",
         f: 'json',
         expiration: 86400,
         client: 'referer',
         referer: window.location.origin
       }, callback);
     }

     serverAuth(function(error, response){
       var dl = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SuffolkCountySewers/MapServer/16',
         opacity: 1,
         token:  response.token,
         onEachFeature: onEachFeature,
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

       dl.on('mouseover', highlightFeature);
       dl.on('mouseout', resetHighlight);
       
       function highlightFeature(e) {
        console.log(dl._layers[1].feature.properties.ContractNumber)
        var layer = e.layer;
        layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
          });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }
      }


      function onEachFeature(feature, layer) {
        layer._id = feature.id
      }


      function resetHighlight(e) {
        var layer = e.layer
        layer.setStyle({
          color:'#FF4500',
          weight: 2,
          fillOpacity: .1
        })
      }

       //wire up event listener to fire query when users click on a feature
       dl.on("click", queryRelated);

       function queryRelated (evt) {
        // console.log(dl.query().nearby(evt.latlng,1).featureIds(function(ids){return ids}))
        dl.query().nearby(evt.latlng,1).ids(function(error, ids){
          forEach})
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