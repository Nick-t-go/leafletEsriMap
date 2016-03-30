/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope){

    $("#myModal").draggable({
      handle: ".modal-header"
  });

  var div = L.DomUtil.get('myModal');
  if (!L.Browser.touch) {
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.on(div, 'mousewheel', L.DomEvent.stopPropagation);
  } else {
      L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation);
  }

  $scope.displayInfo = false;
  $scope.selectedFeatures = [];
  $scope.selectedDistricts = [];
  $scope.relatedRecords = {}
  $scope.doc = "";
  $scope.mapLayers = [];
  $scope.selectOn = [];

  $scope.test =function(sLayer){
    $scope.displayInfo = sLayer.name;
    $scope.selectedFeatures = [];
    $scope.selectOn.push(sLayer)
    if($scope.selectOn.length > 1){
      $scope.selectOn[0].off('click')
      $scope.selectOn.shift();
    }
    sLayer.on('click', sLayer.click)
  }

  $scope.returnRelated = function(objectId){
    $scope.query.objectIds([objectId]).relationshipId(4).run(function(error, response, raw) {
      $scope.relatedRecords.contracts = response.features;
      $scope.relatedRecords.contracts[0].style = {'background-color': 'lightgrey'}
      $scope.contract = response.features[0].properties
      $scope.$digest()
    })
    $scope.relatedRecords.documents = [];
    console.log('here')
    $("#contracts").tab('show')
  }

  $scope.returnRelatedDistricts = function(objectId){
    $scope.relatedRecords = {};
    $scope.distQuery.objectIds([objectId]).relationshipId(6).run(function(error, response, raw) {
     $scope.relatedRecords.contracts = response.features;
     $scope.$digest()
    })
    $scope.distQuery.objectIds([objectId]).relationshipId(5).run(function(error, response, raw) {
     $scope.relatedRecords.documents = response.features;
     $scope.$digest()
    })
  }



  $scope.returnContract =  function(selectedItem){
    $scope.data.forEach(function(item){
      item.properties === selectedItem ? item.style = {'background-color': 'lightgrey'} : item.style = {}
    })
    $scope.contract = selectedItem;
    $("#contract-details").tab('show')
  }

  $scope.returnDoc =  function(selectedItem, type){
    $scope.doc = selectedItem;
    $scope.doc.type = type
    $("#contract-details").tab('show') 
 }



  $scope.activateDirective = function(section){
    $scope.displayInfo = section;
    $scope.showSearch = false;
  }

    $scope.user = {};
    
    if(!map){
      var map = L.map('map').setView([40.792240, -73.138260], 12);
    }

    L.esri.basemapLayer('Topographic').addTo(map);

    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'),{ toggleDisplay: true}).addTo(map);
    $scope.data = [];
    function serverAuth(callback){
       L.esri.post('https://fs-gdb10:6443/arcgis/tokens/generateToken', {
         username: 'ntoscano',
         password: "*********",
         f: 'json',
         expiration: 86400,
         client: 'referer',
         referer: window.location.origin
       }, callback);
     }

     serverAuth(function(error, response){
       $scope.dl = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/16',
         opacity: 1,
         token:  response.token,
         style: function(feature){
           return {color:'#FF4500', weight: 2}}
       }).addTo(map);

       $scope.dl.name="Sewer Outlines";
       $scope.dl.click = queryRelated;
       $scope.mapLayers.push($scope.dl);


       $scope.sd = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/17',
         opacity: 1,
         token:  response.token,
         style: function(feature){
           return {color:'#4169e1', weight: 2}}
       }).addTo(map);


       $scope.sd = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/7',
         opacity: 1,
         token:  response.token,
         style: function(feature){
           return {color:'#ffff00', weight: 2}}
       }).addTo(map);



       $scope.sd.name="Sewer Districts"
       $scope.sd.click = queryRelated;
       $scope.mapLayers.push($scope.sd);


       $scope.dl.on('authenticationrequired', function (e) {
         serverAuth(function(error, response){
           e.authenticate(response.token);
         });
       });

       $scope.sd.on('authenticationrequired', function (e) {
         serverAuth(function(error, response){
           e.authenticate(response.token);
         });
       });


       $scope.query = L.esri.Related.query($scope.dl);
       $scope.distQuery = L.esri.Related.query($scope.sd);

       $scope.dl.on('mouseover', highlightFeature);
       $scope.dl.on('mouseout', resetHighlight);


       
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

      $scope.getLayerHighlight=function(id){
        var e = {}
        e.layer = $scope.dl._layers[id]
        highlightFeature(e)
      }

      $scope.getLayerReset=function(id){
        console.log("reset")
        var e = {}
        e.layer = $scope.dl._layers[id]
        resetHighlight(e)
      }


      function resetHighlight(e) {
        var layer = e.layer
        layer.setStyle({
          color: '#FF4500',
          weight: 2,
          fillOpacity: .1
        })
      }

       //wire up event listener to fire query when users click on a feature
       // $scope.dl.on("click", queryRelated);
       // $scope.sd.on("click", queryRelatedMulti);

       function queryRelated (evt) {
        $("#selected-features").tab('show')
        $scope.selectedFeatures = []
        // console.log($scope.dl.query().nearby(evt.latlng,1).featureIds(function(ids){return ids}))
        $scope.dl.query().nearby(evt.latlng,1).ids(function(error, ids){
          if(ids){
            ids.forEach(function(id){
              $scope.selectedFeatures.push($scope.dl._layers[id].feature.properties)
            })
          }
          $scope.$digest()
        })
        //if multiple ids let user click one polygon
        //else run function that returns records
       }

       $scope.queryByString= function(string){
          
          $scope.selectedFeatures = []
          $scope.dl.query().where("ContractNumber = '"+string+"'").ids(function(error, ids){
          if(ids){
            ids.forEach(function(id){
              $scope.selectedFeatures.push($scope.dl._layers[id].feature.properties)
              $scope.returnRelated($scope.selectedFeatures[0].OBJECTID)
            })
          }
          $scope.$digest()
          $("#contract-details").tab('show')
        })
        }



     });
   })