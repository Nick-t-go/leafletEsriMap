/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope){

  $scope.displayInfo = false;
  $scope.selectedFeatures = [];
  $scope.selectedDistricts = [];
  $scope.relatedRecords = {}
  $scope.doc = ""

  $scope.returnRelated = function(objectId){
         $scope.query.objectIds([objectId]).relationshipId(4).run(function(error, response, raw) {
           $scope.data = response.features;
           $scope.data[0].style = {'background-color': 'lightgrey'}
           $scope.contract = response.features[0].properties
           $scope.$digest()
         })
         $("#contracts").tab('show')
  }

  $scope.returnRelatedDistricts = function(objectId){
         $scope.distQuery.objectIds([objectId]).relationshipId(6).run(function(error, response, raw) {
           $scope.relatedRecords.contracts = response.features;
           $scope.$digest()
         })
         $scope.distQuery.objectIds([objectId]).relationshipId(5).run(function(error, response, raw) {
           $scope.relatedRecords.documents = response.features;
           $scope.$digest()
         })
         console.log($scope.relatedRecords)
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
 }



  $scope.activateDirective = function(section){
    $scope.displayInfo = section;
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
         password: "********",
         f: 'json',
         expiration: 86400,
         client: 'referer',
         referer: window.location.origin
       }, callback);
     }

     serverAuth(function(error, response){
       var dl = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/16',
         opacity: 1,
         token:  response.token,
         style: function(feature){
           return {color:'#FF4500', weight: 2}}
       }).addTo(map);


       var sd = L.esri.featureLayer({
         url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/17',
         opacity: 1,
         token:  response.token,
         style: function(feature){
           return {color:'#4169e1', weight: 2}}
       }).addTo(map);


       dl.on('authenticationrequired', function (e) {
         serverAuth(function(error, response){
           e.authenticate(response.token);
         });
       });

       sd.on('authenticationrequired', function (e) {
         serverAuth(function(error, response){
           e.authenticate(response.token);
         });
       });


       $scope.query = L.esri.Related.query(dl);
       $scope.distQuery = L.esri.Related.query(sd);

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
          color: '#FF4500',
          weight: 2,
          fillOpacity: .1
        })
      }

       //wire up event listener to fire query when users click on a feature
       dl.on("click", queryRelated);
       sd.on("click", queryRelatedMulti);

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


       function queryRelatedMulti (evt) {
        $scope.selectedDistricts = []
        sd.query().nearby(evt.latlng,1).ids(function(error, ids){
          if(ids){
            ids.forEach(function(id){
              $scope.selectedDistricts.push(sd._layers[id].feature.properties)
            })
          }
          $scope.$digest()
        })
       }




       $scope.queryByString= function(string){
          
          $scope.selectedFeatures = []
          dl.query().where("ContractNumber = '"+string+"'").ids(function(error, ids){
          if(ids){
            ids.forEach(function(id){
              $scope.selectedFeatures.push(dl._layers[id].feature.properties)
              $scope.returnRelated($scope.selectedFeatures[0].OBJECTID)
            })
          }
          $scope.$digest()
          $("#contract-details").tab('show')
        })
        }



     });
   })