module.exports = angular.module('mapApp')

.controller('MapController', function($scope, globals, geo, busStops) {

	geo.getCurrentPosition().then(function(position) {
		var coords = position.coords;

		var mapOptions = {
			center: new google.maps.LatLng(coords.latitude, coords.longitude),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

		busStops.getLocal(coords).then(function(response) {
			console.log('Success', response);

			var markers = [];

			angular.forEach(response.data.stops, function(stop) {

				var position = new google.maps.LatLng(stop.latitude, stop.longitude);

				var marker = {
					id: stop.atcocode,
					position: position,
					title: stop.name
				};

				markers.push(marker);
			});

			$scope.markers = markers;

		}, function(error) {
			console.log('Error: ', error);
		});

	});

});