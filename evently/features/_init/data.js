function(data) {
	var features = data.rows.sort(function(a,b) { return b.value - a.value; }).slice(0,10);
	return {
		features: features.map(function(feature) {
			return {
				name: feature.key,
				count: feature.value
			};
		})
	};
}
