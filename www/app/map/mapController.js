module.exports = angular.module('mapModule')

.controller('MapController', function($scope, geoService, busStopsService) {
	'ngInject';

	$scope.position = {};
	$scope.busStops = {};
	$scope.error = '';

	this.init = function() {
		$scope.getPosition = this.getPosition;
		$scope.getBusStopsNearby = this.getBusStopsNearby;
		$scope.buildMap = this.buildMap;

		this.getPosition();
	};

	this.getPosition = function() {
		geoService.getCurrentPosition()
			.then(function(position) {
				$scope.position = position;
				$scope.getBusStopsNearby();
			})
			.catch(function() {
				$scope.error = 'There has been an error.';
			});
	};

	this.getBusStopsNearby = function() {
		var coords = $scope.position.coords;

		busStopsService.getLocal(coords)
			.then(function(response) {
				$scope.busStops = response;
				$scope.buildMap();
			})
			.catch(function() {
				$scope.error = 'There has been an error.';
			});
	};

	this.buildMap = function() {
		var data = $scope.busStops.data;
		var markers = [];

		var mapOptions = {
			center: new google.maps.LatLng(data.latitude, data.longitude),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

		angular.forEach(data.stops, function(stop) {

			var LatLng = new google.maps.LatLng(stop.latitude, stop.longitude);

			var marker = {
				id: stop.atcocode,
				position: LatLng,
				title: stop.name
			};

			markers.push(marker);
		});

		$scope.markers = markers;
	};

	this.init();
});