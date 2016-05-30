module.exports = angular.module('services')
	.service('busStopsService', busStopsService);

/* ngInject */
function busStopsService($http, $httpParamSerializer, globalsFactory) {
	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	};

	this.getLocal = function (coords) {
		return $http({
			method: 'GET',
			url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
		});
	};
}
