module.exports = angular.module('bustleApp.services')
	.factory('busStopsService', busStopsService);

/* ngInject */
function busStopsService($http, $httpParamSerializer, globalsFactory) {

	var busStopData = null;

	function generateQueryObj(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	}

	function getLocal(coords) {
		var data = $http({
			method: 'GET',
			url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
		});

		return data.then(function(data) {
			busStopData = data;
			return data;
		});
	}

	return {
		busStopData: busStopData,
		getLocal: getLocal
	};

}
