/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope, uStyle) {

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

    $scope.showPDF = function(pdf) {
        $scope.imageLink = pdf;
        $("#contracts").tab('show')
    }

    $scope.displayInfo = false;
    $scope.selectedFeatures = [];
    $scope.selectedDistricts = [];
    $scope.relatedRecords = {}
    $scope.doc = "";
    $scope.mapLayers = [];
    $scope.selectOn = [];
    $scope.showLegend = false;
    $scope.loading = false
    var boxOn = false;

    $scope.test = function(sLayer) {
        $scope.displayInfo = sLayer.name;
        $scope.selectedFeatures = [];
        $scope.selectOn.push(sLayer)
        if ($scope.selectOn.length > 1) {
            $scope.selectOn[0].off('click')
            $scope.selectOn[0].off('mouseover')
            $scope.selectOn[0].off('mouseout')
            $scope.selectOn.shift();
        }
        sLayer.on('click', sLayer.click)
        sLayer.on('mouseover', $scope.highlightFeature);
        sLayer.on('mouseout', $scope.resetHighlight);
    }


    $scope.returnRelated = function(objectId, source) {
        $scope.relatedRecords = {};
        $scope.query.objectIds([objectId]).relationshipId(4).run(function(error, response, raw) {
            $scope.relatedRecords.contracts = response.features;
            if (response.features.length != 0) {
                $scope.contract = response.features[0].properties
            } else {
                $scope.contract = []
            }
            $scope.$digest()
        })
        source === "textSearch" ? $("#selected-features").tab('show') : $("#contracts").tab('show')
    }


    $scope.changeStyle = function(feature, field) {
        uStyle[field](feature, uStyle[field+'Style'])
    }

    $scope.removeFromMap = function(layer){
        if ($scope.map.hasLayer(layer)){
            $scope.map.removeLayer(layer); 
            layer.visible = false;
        }
        else{
            $scope.map.addLayer(layer); 
            layer.visible = true;
        } 
    }


    function initFeatureLayer(featureLayer,name, type, fields, color, tblField){
        featureLayer.name = name;
        featureLayer.type = type;
        featureLayer.fields = fields;
        featureLayer.tblField = tblField;
        featureLayer.color = color;
        featureLayer.visible = true;
        $scope.mapLayers.push(featureLayer)
        $scope.$digest()
    }

    

    $scope.returnRelatedDistricts = function(objectId) {
        $scope.relatedRecords = {};
        $scope.distQuery.objectIds([objectId]).relationshipId(5).run(function(error, response, raw) {
            $scope.relatedRecords.contracts = response.features;
            $scope.$digest()
        })
        $scope.distQuery.objectIds([objectId]).relationshipId(6).run(function(error, response, raw) {
            $scope.relatedRecords.documents = response.features;
            $scope.$digest()
        })
        $("#contracts").tab('show')
    }



    $scope.returnContract = function(selectedItem) {
        $scope.data.forEach(function(item) {
            item.properties === selectedItem ? item.style = { 'background-color': 'lightgrey' } : item.style = {}
        })
        $scope.contract = selectedItem;
        $("#contract-details").tab('show')
    }

    $scope.returnDoc = function(selectedItem, type) {
        $scope.doc = selectedItem;
        $scope.doc.type = type
        $("#contract-details").tab('show')
    }



    $scope.activateDirective = function(section) {
        $scope.displayInfo = section;
        $scope.showSearch = false;
    }

    $scope.boxSelect = function(){
        if(!boxOn){
         $scope.map.on('mousedown', handleMouseDown, this);
         boxOn = true
        }
        else{
            console.log('here')
            $scope.map.off('mousedown', handleMouseDown, this);
             $scope.map.dragging.enable();
            boxOn = false;
        }
    };
    


    $scope.user = {};

    if (!$scope.map) {
        $scope.map = L.map('map').setView([40.792240, -73.138260], 12);


        L.easyPrint({
        title: 'My awesome print button',
        position: 'topright',
        elementsToHide: 'button, h2, h3, .leaflet-control-minimap, .leaflet-control-zoom, .leaflet-control-attribution, draw, .nav, title'
        }).addTo($scope.map);

        function handleMouseDown(event) {
          $scope.map.boxZoom._onMouseDown.call($scope.map.boxZoom, { clientX:event.originalEvent.clientX, clientY:event.originalEvent.clientY, which:1, shiftKey:true });
          $scope.map.dragging.disable();
          $scope.map.boxZoom.addHooks();
        }

        
        $scope.map.on("boxzoomend", function(e) {
            $scope.loading = true;
            $scope.selectedFeatures = [];
            $scope.selectableLayer.query().intersects(e.boxZoomBounds).ids(function(error, ids) {
                    if (ids) {
                        console.log(ids)
                        ids.forEach(function(id) {
                            $scope.selectedFeatures.push($scope.selectableLayer._layers[id].feature.properties)
                        })
                        $scope.loading = false;
                    }
                    $scope.$digest()
                    $scope.loading = false;
                });
            $("#selected-features").tab('show')
        })
    }



    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'), { toggleDisplay: true }).addTo($scope.map);
    $scope.data = [];



    function serverAuth(callback) {
        L.esri.post('https://fs-gdb10:6443/arcgis/tokens/generateToken', {
            username: myName,
            password: myPassword,
            f: 'json',
            expiration: 86400,
            client: 'referer',
            referer: window.location.origin
        }, callback);
    }

    

    serverAuth(function(error, response) {
        $scope.dl = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/8',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#FF4500', weight: 2 }
            }
        }).addTo($scope.map);

        initFeatureLayer($scope.dl, "Sewer Outlines", 'polygon',
            [{name: 'default',color: '#FF4500', weight: 2, opactiy:1 }], '#FF4500')

        $scope.dl.click =  queryRelated;

        $scope.sd = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/9',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#4169e1', weight: 2 }
            }
        }).addTo($scope.map);

        initFeatureLayer($scope.sd, "Sewer Districts", 'polygon',
            [{name: 'default', color: '#4169e1', weight: 2 , opactiy:1 }], '#4169e1')

        $scope.sd.click =  queryRelated;


        $scope.sewerSheets = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/7',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#ffff00', weight: 2 }
            }
        }).addTo($scope.map);

        initFeatureLayer($scope.sewerSheets, "Sewer Sheets", 'polygon',
            [{name: 'default', color: '#ffff00', weight: 2 , opactiy:1 }], "#ffff00")

        $scope.sewerSheets.click =  queryRelated;

        $scope.manholes = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/0',
            token: response.token,
            pointToLayer: function(geojson, latlng) {
                return L.circleMarker(latlng);
            },
            style: {
                color: '#5B7CBA',
                weight: 2,
                opacity: 0.85,
                fillOpacity: 0.5
            }
        }).addTo($scope.map);

        initFeatureLayer( $scope.manholes, "Manholes", 'point',
            [{name: 'default', color: '#5B7CBA', weight: 2,opacity: 0.85,fillOpacity: 0.5 }], "#5B7CBA")


        $scope.sewerMains = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/2',
            opacity: 1,
            token: response.token,
            }).addTo($scope.map)

        initFeatureLayer( $scope.sewerMains, "Sewer Mains", 'polyline')

        uStyle.subType($scope.sewerMains, uStyle.subTypeStyle)
           

        $scope.dl.on('authenticationrequired', function(e) {
            serverAuth(function(error, response) {
                e.authenticate(response.token);
            });
        });

        $scope.sd.on('authenticationrequired', function(e) {
            serverAuth(function(error, response) {
                e.authenticate(response.token);
            });
        });

        $scope.manholes.on('authenticationrequired', function(e) {
            serverAuth(function(error, response) {
                e.authenticate(response.token);
            });
        });


        $scope.sewerMains.on('authenticationrequired', function(e) {
            serverAuth(function(error, response) {
                e.authenticate(response.token);
            });
        });


        $scope.query = L.esri.Related.query($scope.dl);
        $scope.distQuery = L.esri.Related.query($scope.sd);




        $scope.highlightFeature = function(e) {
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

        $scope.getLayerHighlight = function(parentLayer, id) {
            layer = parentLayer._layers[id]
            layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
        }

        $scope.getLayerReset = function(parentLayer, id) {
            
            if(!parentLayer.tblField){
                parentLayer.resetStyle(id)
            }
            else{
            layer = parentLayer._layers[id];
            parentLayer.setFeatureStyle(id, uStyle[parentLayer.tblField+"Style"])
            }
            
        }


        $scope.resetHighlight = function(e) {
            var layer = e.layer
            if(!e.target.tblField){
                e.target.resetStyle(layer.id)
            }
            else{
                layer = e.layer;
                var func = e.target.tblField+"Style"
                console.log(uStyle[func])
                e.target.setFeatureStyle(layer.feature.id, uStyle[func])
            }
            //e.target.resetStyle(layer.feature.id);
        }

        //* replace with resetStyle() method

        //wire up event listener to fire query when users click on a feature
        // $scope.dl.on("click", queryRelated);
        // $scope.sd.on("click", queryRelatedMulti);

        function queryRelated(evt) {
            console.log(evt);
            $("#selected-features").tab('show')
            $scope.selectedFeatures = []
                // console.log($scope.dl.query().nearby(evt.latlng,1).featureIds(function(ids){return ids}))
            evt.target.query().nearby(evt.latlng, 1).ids(function(error, ids) {
                    if (ids) {
                        ids.forEach(function(id) {
                            $scope.selectedFeatures.push(evt.target._layers[id].feature.properties)
                        })
                    }
                    $scope.$digest()
                })
                //if multiple ids let user click one polygon
                //else run function that returns records
        }


        $scope.queryByString = function(string) {

            $scope.selectedFeatures = [];
            $scope.dl.query().where("ContractNumber LIKE '%" + string + "%'").ids(function(error, ids) {
                if (ids) {
                    ids.forEach(function(id) {
                        $scope.selectedFeatures.push($scope.dl._layers[id].feature.properties)
                        $scope.returnRelated($scope.selectedFeatures[0].OBJECTID, "textSearch")
                    })
                }
                $scope.$digest()
                $("#selected-features").tab('show')
            })
        }



    });
})
