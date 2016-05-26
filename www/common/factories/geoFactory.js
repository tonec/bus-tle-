module.exports = angular.module('factories')

.factory('geoFactory', function($q, $window, $rootScope) {
	'ngInject';

	return {
		getCurrentPosition: function() {
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
		}
	};
});