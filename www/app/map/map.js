angular.module('mapApp.map', ['uiGmapgoogle-maps'])

.controller('MapCtrl', function($scope, stopsService) {
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	// busStops.get(51.534121, -0.006944).then(function(response) {
	// 	console.log(response)
	// });
});