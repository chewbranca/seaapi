function(doc) {
	// TODO:: REMOVE HACK TO CHECK FOR FEATURE
	if (doc.geometry && doc.geometry.type === "Point" && doc.feature) {
		emit({
			type		: "Point",
			coordinates	: [doc.geometry.coordinates[0], doc.geometry.coordinates[1]]
		}, [doc.feature, doc.geometry.coordinates]);
	}
}
