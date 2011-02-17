function(doc) {
	if (doc.feature)
		emit(doc.feature, 1);
};