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

	google.maps.event.addListener(geo.map, "click", function(event) {
		var marker = new google.maps.Marker({
			position: event.latLng,
			map: geo.map
		});

		google.maps.event.addListener(marker, "click", function(event) {
			console.log("Loading overlay");
			console.log($("#overlay"));
			console.log("Marker position");
			console.log(marker.position);
			$("form#new-item input[name='lat']").val(marker.getPosition().lat());
			$("form#new-item input[name='lng']").val(marker.getPosition().lng());
			$("#overlay").overlay({
				// custom top position
				top: 260,
			 
				effect: 'apple',
				// some mask tweaks suitable for facebox-looking dialogs
				mask: {
			 
					// you might also consider a "transparent" color for the mask
					color: '#fff',
			 
					// load mask a little faster
					loadSpeed: 200,
			 
					// very transparent
					opacity: 0.5
				},
			 
				// disable this for modal dialog-type of overlays
				closeOnClick: false
			}).toggle();

			$("#overlay button.close").click(function(event) {
				event.preventDefault();
				$("#overlay").toggle();
			});

		});

		$("form#new-item").submit(function(event) {
			event.preventDefault();
			var data = $(this).serializeJSON();
			var doc = {
				name : data.name,
				description : data.description,
				latitude : data.lat,
				longitude : data.lng,
				url: data.url,
				feature : "User Generated",
				type : "user-generated",
				subtype : "web-content",
				geometry : {
					coordinates : [
						parseFloat(data.lng),
						parseFloat(data.lat)
					],
					type : "Point"
				}
			};
			console.log(doc);
			app.db.saveDoc(doc, {
				success : function(resp) {
					console.log(resp);
					alert('Successfully saved your doc!!!');
					$("#overlay button.close").trigger("click");
					marker.setMap(null);
				}
			});
		});
	});

	app.geo = geo;
}
