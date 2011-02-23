function(data) {
	var userData = null;
	data.rows.map(function(feature) {
		if (feature.key == 'User Generated') {
			userData = feature;
		}
	});
	var features = data.rows.sort(function(a,b) { return b.value - a.value; }).slice(0,10);
	if (userData) {
		features.push(userData);
	}
	return {
		features: features.map(function(feature) {
			return {
				name: feature.key,
				count: feature.value
			};
		})
	};
}
