(function($) {
	// Thanks to: http://api.jquery.com/serializeArray/#comment-130159436
	$.fn.serializeJSON = function() {
		var json = {};
		jQuery.map($(this).serializeArray(), function(e, i) {
			json[e.name] = e.value;
		});
		return json;
	};
})(jQuery);
