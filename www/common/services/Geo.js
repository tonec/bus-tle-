module.exports = angular.module('Geo')

.factory('Geo', ['$q', '$window', function($q, $window) {
	return {
		getCurrentPosition: function() {
			var deferred = $q.defer();

			$window.navigator.geolocation.getCurrentPosition(function(position) {
				deferred.resolve(position);
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}
	};
}]);