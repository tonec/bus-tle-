module.exports = angular.module('busStops')

.factory('busStops', ['$http', '$httpParamSerializer', 'globals', function($http, $httpParamSerializer, globals) {

	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globals.app_key,
			app_id: globals.app_id
		};
	};

	return {
		getLocal: function (coords) {
			return $http({
				method: 'GET',
				url: globals.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
			});
		}
	};
}]);