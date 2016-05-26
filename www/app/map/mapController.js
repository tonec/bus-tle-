module.exports = angular.module('mapModule')

.controller('MapController', function($scope, geoFactory, busstopsFactory) {
	'ngInject';

	$scope.refresh = function() {
		geoFactory.getCurrentPosition().then(function(position) {
			var coords = position.coords;

			var mapOptions = {
				center: new google.maps.LatLng(coords.latitude, coords.longitude),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: false
			};

			$scope.mapOptions = mapOptions;

			busstopsFactory.getLocal(coords).then(function(response) {
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
	};

	$scope.refresh();

});