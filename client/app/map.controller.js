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
        uStyle[field](feature)
    }


    function initFeatureLayer(featureLayer,name, type, fields, color, tblField){
        featureLayer.name = name;
        featureLayer.type = type;
        featureLayer.fields = fields;
        featureLayer.tblField = tblField;
        featureLayer.color = color;
        $scope.mapLayers.push(featureLayer)
        $scope.$digest()
    }

    

    $scope.returnRelatedDistricts = function(objectId) {
        $scope.relatedRecords = {};
        $scope.distQuery.objectIds([objectId]).relationshipId(6).run(function(error, response, raw) {
            $scope.relatedRecords.contracts = response.features;
            $scope.$digest()
        })
        $scope.distQuery.objectIds([objectId]).relationshipId(5).run(function(error, response, raw) {
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

    $scope.user = {};

    if (!map) {
        var map = L.map('map').setView([40.792240, -73.138260], 12);
    }

    L.esri.basemapLayer('Topographic').addTo(map);

    var miniMap = new L.Control.MiniMap(L.esri.basemapLayer('Topographic'), { toggleDisplay: true }).addTo(map);
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
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/16',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#FF4500', weight: 2 }
            }
        }).addTo(map);

        initFeatureLayer($scope.dl, "Sewer Outlines", 'polygon',
            [{name: 'default',color: '#FF4500', weight: 2, opactiy:1 }], '#FF4500')

        $scope.dl.click =  queryRelated;

        $scope.sd = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/17',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#4169e1', weight: 2 }
            }
        }).addTo(map);

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
        }).addTo(map);

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
        }).addTo(map);

        initFeatureLayer( $scope.manholes, "Manholes", 'point',
            [{name: 'default', color: '#5B7CBA', weight: 2,opacity: 0.85,fillOpacity: 0.5 }], "#5B7CBA")


        $scope.sewerMains = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/2',
            opacity: 1,
            token: response.token,
            }).addTo(map)

        initFeatureLayer( $scope.sewerMains, "Sewer Mains", 'polyline')

        uStyle.subType($scope.sewerMains)
           

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
            var e = {}
            e.layer = parentLayer._layers[id]
            $scope.highlightFeature(e)

        }

        $scope.getLayerReset = function(parentLayer, id) {
            console.log("reset")
            var e = {};
            e.layer = parentLayer._layers[id];
            $scope.resetHighlight(e);
            $scope.colorGrab = parentLayer.color;
        }


        $scope.resetHighlight = function(e) {
            var layer = e.layer
            layer.setStyle({
                color: e.target ? e.target.color : $scope.colorGrab,
                weight: 2,
                fillOpacity: .1
            })
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
