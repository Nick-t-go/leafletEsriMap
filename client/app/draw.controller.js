app.controller('DrawCtrl', function($scope, uStyle) {
 	
 	$scope.basemap = L.esri.basemapLayer('Topographic')
    $scope.basemap.addTo($scope.map);
	

	//DRAW CONTROL
	$scope.drawnItems = new L.FeatureGroup();
	$scope.map.addLayer($scope.drawnItems)

	$scope.drawControl = new L.Control.Draw({
		edit: {
			featureGroup:($scope.drawnItems)
		}
	});
	$scope.map.addControl($scope.drawControl);


	$scope.map.on('draw:created', function (e) {
    // Saves Drawn Item to Layer
    	$scope.drawnItems.addLayer(e.layer)
	});


	//MEASURE CONTROL
	$scope.measureControl = new L.Control.measureControl()
	$scope.map.addControl($scope.measureControl)

	$scope.removeControl = function(){
		//If any item on the draw toolbar is pressed this disables the measure tool.
		$scope.measureControl.handler.disable.call($scope.measureControl.handler)
	}

	$(".leaflet-draw-toolbar").children().on('click', function(){
		//jQuery Applying removeControl function to all elements on the draw toolbar
		$scope.measureControl.handler.disable.call($scope.measureControl.handler)
	})

	//Book Mark Custom Control
	$scope.createBookmark = function(){
		$scope.savedBounds = ($scope.map.getBounds())
	}

	$scope.zoomTo = function(){
		$scope.map.fitBounds($scope.savedBounds)
	}

	//Basemap Switch Custom Control

	$scope.baseMapOptions = ['Topographic', 'Oceans', 'Gray', 'DarkGray', 'Imagery', 'Terrain']

	$scope.changeBase = function(base){
		console.log(base)
		$scope.map.removeLayer($scope.basemap)
		$scope.basemap = L.esri.basemapLayer(base)
		console.log($scope.basemap)
		$scope.map.addLayer($scope.basemap)
	}


})
