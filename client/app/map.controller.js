/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope, Auth ){

  $scope.displayInfo = false;
  $scope.selectedFeatures = [];

  $scope.returnRelated = function(objectId){
         $scope.query.objectIds([objectId]).relationshipId(6).run(function(error, response, raw) {
           $scope.data = response.features;
           $scope.data[0].style = {'background-color': 'lightgrey'}
           $scope.contract = response.features[0].properties
           $scope.$digest()
         })
         $("#contracts").tab('show')
  }
  $scope.returnContract =  function(selectedItem){
    $scope.data.forEach(function(item){
      item.properties === selectedItem ? item.style = {'background-color': 'lightgrey'} : item.style = {}
    })
    $scope.contract = selectedItem;
    $("#contract-details").tab('show')

  }

  $scope.activateContracts = function(){
    $scope.displayInfo = !$scope.displayInfo;
  }

    $scope.user = {};

    var map = L.map('map').setView([40.792240, -73.138260], 12);

    L.esri.basemapLayer('Topographic').addTo(map);

    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'),{ toggleDisplay: true}).addTo(map);
    $scope.data = [];
    function serverAuth(callback){
       L.esri.post('https://fs-gdb10:6443/arcgis/tokens/generateToken', {
         username: 'ntoscano',
         password: "***!",
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
       $scope.query = L.esri.Related.query(dl);

       dl.on('mouseover', highlightFeature);
       dl.on('mouseout', resetHighlight);


       
       function highlightFeature(e) {
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

      $scope.getLayerHighlight=function(id){
        var e = {}
        e.layer = dl._layers[id]
        highlightFeature(e)
      }

      $scope.getLayerReset=function(id){
        console.log("reset")
        var e = {}
        e.layer = dl._layers[id]
        resetHighlight(e)
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
        $("#selected-features").tab('show')
        $scope.selectedFeatures = []
        // console.log(dl.query().nearby(evt.latlng,1).featureIds(function(ids){return ids}))
        dl.query().nearby(evt.latlng,1).ids(function(error, ids){
          if(ids){
            ids.forEach(function(id){
              $scope.selectedFeatures.push(dl._layers[id].feature.properties)
            })
          }
          $scope.$digest()
        })
        //if multiple ids let user click one polygon
        //else run function that returns records
       }
     });
   })