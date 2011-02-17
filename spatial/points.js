function(doc) {
	if (doc.geometry && doc.geometry.type === "Point") {
		emit({
			type		: "Point",
			coordinates	: [doc.geometry.coordinates[0], doc.geometry.coordinates[1]]
		}, [doc.feature, doc.geometry.coordinates]);
	}
}
