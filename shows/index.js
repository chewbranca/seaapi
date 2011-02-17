function(doc, req) {
	var ddoc = this;
	var Mustache = require("lib/mustache");


	var map = {
		ddoc	: JSON.stringify(require("vendor/couchapp/lib/code").ddoc(ddoc), function(key, value) {
			return (key == "parent") ? undefined : value;
		}),
		title	: ddoc.seaapi.title,
		lat		: ddoc.seaapi.lat,
		lng		: ddoc.seaapi.lng,
		sea_db	: ddoc.seaapi.sea_db,
		sea_design	: ddoc.seaapi.sea_design
	};
	
	return Mustache.to_html(ddoc.templates.index, map);
}