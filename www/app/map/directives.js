module.exports = angular.module('MapApp')

.directive('uiMap', function() {

	return {
		restrict: 'E',
		template: '<div id="gmaps" class="map"></div>',
		replace: true,
		scope: {
			options: '='
		},
		link: function (scope, element, attr) {
			var map;
			var markers = [];
			var mapOptions = scope.options;

			function initMap() {
				if (map === void 0) {
					map = new google.maps.Map(element[0], mapOptions);
				}
			}

			function setMarker(map, position, title, content) {
				var marker;
				var markerOptions = {
					position: position,
					map: map,
					title: title,
					icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
				};

				marker = new google.maps.Marker(markerOptions);
				markers.push(marker); // add marker to array

				google.maps.event.addListener(marker, 'click', function () {

					if (infoWindow !== void 0) {
						infoWindow.close();
					}

					var infoWindowOptions = {
						content: content
					};
					infoWindow = new google.maps.InfoWindow(infoWindowOptions);
					infoWindow.open(map, marker);
				});
			}

			initMap();

			setMarker(map, new google.maps.LatLng(51.508515, -0.125487), 'London', 'Just some content');
		}
	};

});