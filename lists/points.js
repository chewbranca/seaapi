function(head, req) {
	var ddoc = this;
	var row, rows = [];
	var feature = req.query.feature || false;

	provides("json", function() {
		while (row = getRow())
			if (!feature || row.value[0].toLowerCase() === feature.toLowerCase())
				rows.push(row);

		return JSON.stringify(rows);
	});
}