/**
 * Created by uzer-y on 2/3/16.
 */
app.controller('MapCtrl', function($scope) {

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
        console.log(feature)
        feature.setStyle(field)
    }

    $scope.horizontalQuality = function(feature) {
            var c, o = 0.75;
            switch (feature.properties.FkMhHorizontalQuality) {
                case 'GIS':
                    c = '#007D7D';
                    break;
                case 'GPS/RTK with NYSNET Correction':
                    c = '#440CE8';
                    break;
                case 'Survey-grade':
                    c = '#FF0000';
                    break;
                case 'Survey-grade':
                    c = '#E89C0C';
                    break;               
                default:
                    c = '#8EFF0D';
            } 
            return { color: c, opacity: o, weight: .5 };
        }

    $scope.dPsSewerDistrict = function(feature) {
            var c, o = 0.75;
            switch (feature.properties.dPsSewerDistrict) {
                case '01':
                case '02':
                case '03':
                case '04':
                case '05':
                case '06':
                case '07':
                case '08':
                    c = '#FF7FFF';
                    break;
                case '11':
                case '12':
                case '13':
                case '14':
                case '15':
                case '16':
                case '17':
                case '18':
                    c = '#40FF40';
                    break;
                case '21':
                case '22':
                case '23':
                case '24':
                case '25':
                case '26':
                case '27':
                case '28':
                    c = '#9D1FCC';
                    break;                              
                default:
                    c = '#639982';
            } 
            return { color: c, opacity: o, weight: .5 };
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

        $scope.dl.name = "Sewer Outlines";
        $scope.dl.click = queryRelated;
        $scope.dl.color = '#FF4500'
        $scope.mapLayers.push($scope.dl);


        $scope.sd = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/17',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#4169e1', weight: 2 }
            }
        }).addTo(map);

        $scope.sd.name = "Sewer Districts"
        $scope.sd.click = queryRelated;
        $scope.sd.color = '#4169e1'
        $scope.mapLayers.push($scope.sd);


        $scope.sewerSheets = L.esri.featureLayer({
            url: 'https://fs-gdb10:6443/arcgis/rest/services/SuffolkCounty/SCSewers/MapServer/7',
            opacity: 1,
            token: response.token,
            style: function(feature) {
                return { color: '#ffff00', weight: 2 }
            }
        }).addTo(map);


        $scope.sewerSheets.name = "Sewer Sheets"
        $scope.sewerSheets.click = queryRelated;
        $scope.sewerSheets.color = "#ffff00"
        $scope.mapLayers.push($scope.sewerSheets);



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

        // $scope.manholes('authenticationrequired', function(e) {
        //     serverAuth(function(error, response) {
        //         e.authenticate(response.token);
        //     });
        // });


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
