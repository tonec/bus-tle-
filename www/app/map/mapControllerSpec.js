describe('mapController', function() {

	beforeEach(angular.mock.module('mapModule'));

	beforeEach(function() {
		angular.mock.module(function($provide) {
			$provide.factory('globalsFactory', function() {
				return {

				}
			});
		});
		angular.mock.module(function($provide) {
			$provide.factory('geoFactory', ['$q', '$window', function($q, $window) {
				return {

				}
			}]);
		});
		angular.mock.module(function($provide) {
			$provide.factory('busstopsFactory', ['$http', '$httpParamSerializer', 'globalsFactory', function($http, $httpParamSerializer, globalsFactory) {
				return {

				}
			}]);
		});
	});

	beforeEach(inject(function(_$rootScope_, _$controller_, _geoFactory_, _busstopsFactory_) {
		$rootScope = _$rootScope_;
		$scope = $rootScope.$new();
		$controller = _$controller_;
		geoFactory = _geoFactory_;
		busstopsFactory = _busstopsFactory_;

		$controller('MapController', {
			'$rootScope': $rootScope,
			'$scope': $scope,
			'geoFactory': geoFactory,
			'busstopsFactory': busstopsFactory
		});
	}));

	it('should be defined.', function($controller) {
		expect($controller).toBeDefined();
	});

});