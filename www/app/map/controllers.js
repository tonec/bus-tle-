module.exports = angular.module('MapApp')

.controller('MapCtrl', function($scope, Globals, Geo) {

	Geo.getCurrentPosition().then(function(position) {
		var coords = position.coords;

		var mapOptions = {
			center: new google.maps.LatLng(coords.latitude, coords.longitude),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

	});



	// url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat=' + lat + '&lon= ' + lon + '&api_key=' + apiKey +'&app_id=' + appId;

	// busStops.get(51.534121, -0.006944).then(function(response) {
	// 	console.log(response)
	// });
});