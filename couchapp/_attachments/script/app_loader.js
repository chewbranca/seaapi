
function couchapp_load(scripts) {
  document.write(scripts.map(function(s) {
    return '<script src="'+s+'"></script>';
  }).join(''));  
}

couchapp_load([
  "/_utils/script/sha1.js",
  "/_utils/script/json2.js",
  "/_utils/script/jquery.js",
  "/_utils/script/jquery.couch.js",
  "vendor/couchapp/jquery.couch.app.js",
  "vendor/couchapp/jquery.couch.app.util.js",
  "vendor/couchapp/jquery.mustache.js",
  "vendor/couchapp/jquery.pathbinder.js",
  "vendor/couchapp/jquery.evently.js",
  "vendor/couchapp/jquery.spatial.js",
  "http://maps.google.com/maps/api/js?sensor=false",
  "http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js",
  "http://cdn.jquerytools.org/1.2.5/all/jquery.tools.min.js",
  "script/jquery_extensions.js",
  "script/underscore.js",
  "script/backbone.js",
  "script/seaapi.js"
]);
