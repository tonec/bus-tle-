module.exports = angular.module('bustleApp.services')
	.service('geoService', geoService);

/* ngInject */
function geoService($q, $window, $rootScope) {
	this.getCurrentPosition = function() {
		var deferred = $q.defer();

		$window.navigator.geolocation.getCurrentPosition(function(position) {
			$rootScope.$apply(function() {
				deferred.resolve(position);
			});
		}, function(error) {
			$rootScope.$apply(function() {
				deferred.reject(error);
			});
		});

		return deferred.promise;
	};
}