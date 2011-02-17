function(event, marker, doc) {
	var app = $$(this).app;
	var geo = app.geo;
	var Mustache = app.require("lib/mustache");

	app.db.openDoc(doc.id, {
		success : function(doc) {
			app.geo.closeInfoWindows();
			doc.lng = doc.geometry.coordinates[0];
			doc.lat = doc.geometry.coordinates[1];
			var html = Mustache.to_html(app.ddoc.templates.markers.show, doc);
			var infoWindow = new google.maps.InfoWindow({
				content	: html,
				size	: new google.maps.Size(200, 200)
			});
			geo.infoWindows.push(infoWindow);
			infoWindow.open(geo.map, marker);
		}
	});
}