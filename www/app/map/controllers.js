module.exports = angular.module('MapApp')

.controller('MapCtrl', function($scope, Globals) {
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	console.log(Globals)

	// url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat=' + lat + '&lon= ' + lon + '&api_key=' + apiKey +'&app_id=' + appId;

	// busStops.get(51.534121, -0.006944).then(function(response) {
	// 	console.log(response)
	// });
});