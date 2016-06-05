(function() {

	angular.module('bustleApp.services')
		.factory('geoService', geoService);

	/* ngInject */
	function geoService($q, $window, $rootScope) {

		var position = null;

		function getCurrentPosition() {
			var deferred = $q.defer();

			$window.navigator.geolocation.getCurrentPosition(function(data) {
				deferred.resolve(data);
			}, function(error) {
				deferred.reject(error);
			});

			deferred.promise.then(function(data) {
				position = data;
			});

			return deferred.promise;
		}

		return {
			position: position,
			getCurrentPosition: getCurrentPosition
		};
	}

})();