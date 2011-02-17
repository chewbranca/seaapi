function(event, feature) {
	var app = $$(this).app;
	var geo = app.geo;

	$(geo.markers).each(function(i,marker) {
		marker.setMap(null);
	});

	var loader = {
		query : function(event, feature) {
			return {
				list			: 'seaapi/points',
				view			: 'points',
				options			: {
					bbox			: geo.bbox.join(','),
					format			: 'json',
					feature			: feature.toLowerCase()
				}
			};
		},
		data : function(data) {
			$.each(data, function(i, doc) {
				var latlng = new google.maps.LatLng(doc.value[1][1], doc.value[1][0]);
				var marker = new google.maps.Marker({
					position: latlng, 
					map: geo.map,
					title: ("A "+feature)
				});
				marker.doc = doc;
				$$(marker).doc_id = doc.id;
				geo.markers.push(marker);
				google.maps.event.addListener(marker, 'click', function() { $(marker).evently('markerClick', app, [marker, doc]); });
			});
		}
	};

	$.couch.spatial(app.db.name).list(loader.query(event, feature).list, loader.query(event, feature).view, $.extend(loader.query(event, feature).options, { success : loader.data }));
}
