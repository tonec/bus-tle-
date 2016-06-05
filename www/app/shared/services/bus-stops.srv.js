(function() {

	angular.module('bustleApp.services')
		.factory('busStopsService', busStopsService);

	/* ngInject */
	function busStopsService($http, $httpParamSerializer, globals) {

		var busStopData = null;

		function generateQueryObj(coords) {
			return {
				lat: coords.latitude,
				lon: coords.longitude,
				app_key: globals.app_key,
				app_id: globals.app_id
			};
		}

		function getLocal(coords) {
			var url = globals.api_url + globals.api_bus.near;

			var data = $http({
				method: 'GET',
				url: url + '?' + $httpParamSerializer(generateQueryObj(coords))
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

})();

