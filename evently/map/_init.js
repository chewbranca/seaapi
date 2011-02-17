function() {
	var app = $$(this).app;
	var mapDiv = $(this).get(0);
	var lng = app.base_lng || -122.3320708;
	var lat = app.base_lat || 47.6062095;
	var latlng = new google.maps.LatLng(lat, lng);


	// TODO:: add geofetch
	var geo = {
		map			: null,
		geocoder	: null,
		markers		: [],
		infoWindows	: [],
		bbox		: [],
		closeInfoWindows : function() {
			$(this.infoWindows).each(function(i, infoWindow) {
				infoWindow.close();
			});
		}
	};

	geo.map = new google.maps.Map(mapDiv, {
		zoom		: 12,
		center		: latlng,
		mapTypeId	: google.maps.MapTypeId.ROADMAP
	});
	google.maps.event.addListener(geo.map, 'bounds_changed', function() {
		var bounds = geo.map.getBounds();
		geo.bbox = [
			bounds.getSouthWest().lng(),
			bounds.getSouthWest().lat(),
			bounds.getNorthEast().lng(),
			bounds.getNorthEast().lat()
		];
	});

	app.geo = geo;
}
