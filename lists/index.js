function(head, req) {
	var ddoc = this;
	var Mustache = require("lib/mustache");


	provides("html", function() {
		var map = {
			title	: ddoc.seaapi.title,
			lat		: ddoc.seaapi.lat,
			lng		: ddoc.seaapi.lng
		};
		
		return Mustache.to_html(ddoc.templates.index, map);
	});
}