$(function() {
	var SeaAPI = {};

	// Utility Functions
	// -----------------

	// Return base database uri -- ie /seaapi/.
	SeaAPI.baseCouchDBUrl = function() {
		return SeaAPI.couchApp.db.uri;
	};

	// Return base design doc uri -- ie /seaapi/_design/seaapi.
	SeaAPI.baseCouchUrl = function() {
		return SeaAPI.baseCouchDBUrl() + SeaAPI.couchApp.design.doc_id;
	};

	// TODO:: extract this for use in common.js.
	SeaAPI.param = function(item) {
		return window.jQuery.param(item);
	};

	// SeaAPI Models
	// -------------

	// CouchDoc Model
	// --------------

	// Base CouchDB Document model. All models corresponding
	// to a CouchDB document extend from the CouchDoc Model.
	SeaAPI.CouchDoc = Backbone.Model.extend({
		url : function() {
			return SeaAPI.baseCouchDBUrl() + this.id;
		}
	});

	// Feature Model
	// -------------

	// **Feature** model for loadings for a given feature
	// Does not extend from CouchDoc as the **Feature** model is
	// the result of a map/reduce function and therefore has
	// no corresponding document in CouchDB.
	SeaAPI.Feature = Backbone.Model.extend({
		initialize : function() {
			this.points = new SeaAPI.Points(null, { feature : this });
		}
	});

	// Point Model
	// -----------

	// Primary **Point** model. This corresponds directly to a CouchDB document.
	//
	// NOTE:: Ideally this will essentially be an abstract class extended by
	// individual classes corresponding to the various **Feature** types.
	SeaAPI.Point = SeaAPI.CouchDoc.extend({
		initialize : function() {
			this.view = new SeaAPI.PointView({ model : this });
		}
	});

	// SeaAPI Collections
	// ------------------

	// Primary Points collection.
	// --------------------------
	// Used as a nested collection in **Feature** models.
	SeaAPI.Points = Backbone.Collection.extend({
		initialize : function(models, options) {
			this.feature = options.feature;
		},

		model : SeaAPI.Point,

		parse : function(response) {
			return _.map(response, function(point) {
				return {
					id          : point.id,
					featureType : point.value[0],
					longitude   : point.value[1][0],
					latitude    : point.value[1][1]
				};
			});
		},

		url : function() {
			var params = {
				bbox    : SeaAPI.geo.bbox.join(','),
				format  : 'json',
				feature : this.feature.get('featureName')
			};
			return SeaAPI.baseCouchUrl() + '/_spatiallist/points/points?' + SeaAPI.param(params);
		}
	});

	// Features Collection
	// -------------------

	// Loads the **Feature** map/reduce query to find the top feature counts.
	SeaAPI.Features = Backbone.Collection.extend({
		model : SeaAPI.Feature,
		url : function() {
			return SeaAPI.baseCouchUrl() + '/_view/features?view=features&group=true';
		},
		parse : function(response) {
			return _.map(response.rows, function(row) {
				return {
					feature : row.key,
					count : row.value,
					featureName : row.key.toLowerCase()
				};
			});
		}
	});

	// SeaAPI Views
	// ------------

	// Point view to render a google marker on the map and then generate an
	// info window when the marker is clicked with the doc info.
	SeaAPI.PointView = Backbone.View.extend({
		initialize : function() {
			this.template = _.template(SeaAPI.couchApp.ddoc.templates.views.feature);
			_.bindAll(this, "markerLoad");
			this.bind("marker:click", this.markerClick);
			this.model.bind("refresh", this.markerLoad);
		},

		buildMarker : function() {
			var point = this.model;
			var latlng = new google.maps.LatLng(point.get('latitude'), point.get('longitude'));
			this.marker = new google.maps.Marker({
				position : latlng,
				map : SeaAPI.geo.map,
				title : ("A "+point.get('featureType'))
			});
			this.addMarkerListener();
		},

		addMarkerListener : function() {
			var that = this;
			google.maps.event.addListener(this.marker, 'click', function() {
				that.trigger("marker:click");
			});
		},

		render : function() {
			this.buildMarker();

			return this;
		},

		unrender : function() {
			this.marker.setMap(null);

			return this;
		},

		markerLoad : function() {
			if (SeaAPI.geo.infoWindow) {
				SeaAPI.geo.infoWindow.close();
			}
			SeaAPI.geo.infoWindow = this.infoWindow = new google.maps.InfoWindow({
				content : this.template({point : this.model}),
				size : new google.maps.Size(200, 200)
			});
			this.infoWindow.open(SeaAPI.geo.map, this.marker);
		},

		markerClick : function() {
			// TODO:: FIX THIS, bind to model refresh
			var that = this;
			this.model.fetch({success: function() {that.markerLoad(); }});
		}
	});

	// Feature View
	// ------------

	// Feature view for generating the top **Features** sidebar overlay and
	// finding the points for that **Feature**.
	SeaAPI.FeatureView = Backbone.View.extend({
		el : $("#feature-list"),

		initialize : function() {
			this.template = _.template(SeaAPI.couchApp.ddoc.templates.views.feature_list);
			this.collection = new SeaAPI.Features;

			_.bindAll(this, "render", "renderPoints");
			this.collection.bind("refresh", this.render);

			this.collection.fetch();
		},

		topFeatures : function() {
			var hasUserContent = _.detect(this.collection.models, function(feature) {
				return feature.get('feature') === "User Generated";
			});

			var data = this.collection.models.sort(function(a, b) {
				return b.get('count') - a.get('count');
			}).slice(0,10);

			if (hasUserContent) {
				data.push(hasUserContent);
			}

			return data;
		},

		events : {
			"mouseenter li.feature" : 'mouseenter',
			"mouseleave li.feature" : 'mouseleave',
			"click li.feature"      : 'loadFeature'
		},

		loadFeature : function(event) {
			var ele = this.$(event.target);

			if (this.feature && this.feature.points) {
				this.removePoints();
			}

			this.feature = this.collection.getByCid(ele.attr('data-id'));
			this.feature.points.bind("refresh", this.renderPoints);

			this.feature.points.fetch();
		},

		mouseenter : function(event) {
			$(event.target).addClass('ui-state-hover');
		},

		mouseleave : function(event) {
			$(event.target).removeClass('ui-state-hover');
		},

		render : function() {
			$(this.el).html(this.template({ features : this.topFeatures() }));

			return this;
		},

		renderPoints : function() {
			this.feature.points.forEach(function(point) {
				point.view.render();
			});
		},

		removePoints : function() {
			this.feature.points.forEach(function(point) {
				point.view.unrender();
			});
		}

	});

	// SeaAPI Map View
	// ---------------

	// Base SeaAPI application view.
	// This is the primary wrapper object that loads the google map and then
	// kicks off the application.
	SeaAPI.MapView = Backbone.View.extend({
		el : $("#map-canvas"),

		mapEl : function() {
			return this.el[0];
		},

		initialize : function() {
			SeaAPI.couchApp = this.options.couchApp;
			SeaAPI.geo = {
				map        : null,
				geocoder   : null,
				infoWindow : null,
				bbox       : []
			};
			this.featureView = new SeaAPI.FeatureView();
			this.lng = SeaAPI.couchApp.base_lng || -122.3320708;
			this.lat = SeaAPI.couchApp.base_lat || 47.6062095;
			this.latlng = new google.maps.LatLng(this.lat, this.lng);
		},

		render : function() {
			SeaAPI.geo.map = new google.maps.Map(this.mapEl(), {
				zoom      : 12,
				center    : this.latlng,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			});
			google.maps.event.addListener(SeaAPI.geo.map, "bounds_changed", function() {
				var bounds = SeaAPI.geo.map.getBounds();
				SeaAPI.geo.bbox = [
					bounds.getSouthWest().lng(),
					bounds.getSouthWest().lat(),
					bounds.getNorthEast().lng(),
					bounds.getNorthEast().lat()
				];
			});
			this.featureView.render();

			return this;
		}
	});

	// Give us a global handle to the SeaAPI object.
	window.SeaAPI = SeaAPI;
});