module.exports = angular.module('bustleApp.mapModule')
	.controller('MapController', MapController);

/* ngInject */
function MapController(geoService, busStopsService, dataService) {
	var mapVm = this;

	this.position = null;
	this.busStopsData = null;
	this.stops = null;
	this.error = null;

	this.init = function() {
		if (dataService.busStopsData) {
			mapVm.busStopsData = dataService.busStopsData;
			mapVm.stops = mapVm.busStopsData.data.stops;
			mapVm.buildMap();
		} else {
			mapVm.getPosition();
		}
	};

	this.getPosition = function() {
		geoService.getCurrentPosition()
			.then(function(position) {
				mapVm.position = position;
				mapVm.getBusStopsNearby();
			})
			.catch(function(error) {
				mapVm.error = error;
			});
	};

	this.getBusStopsNearby = function() {
		var coords = mapVm.position.coords;

		busStopsService.getLocal(coords)
			.then(function(response) {
				mapVm.busStopsData = dataService.busStopsData = response;
				mapVm.buildMap();
			})
			.catch(function(error) {
				mapVm.error = error;
			});
	};

	this.buildMap = function() {
		var data = mapVm.busStopsData.data;
		var markers = [];

		var mapOptions = {
			center: new google.maps.LatLng(data.latitude, data.longitude),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		mapVm.mapOptions = mapOptions;

		angular.forEach(data.stops, function(stop) {
			var LatLng = new google.maps.LatLng(stop.latitude, stop.longitude);
			var marker = {
				id: stop.atcocode,
				position: LatLng,
				title: stop.name
			};

			markers.push(marker);
		});

		mapVm.markers = markers;
	};

	this.init();
}