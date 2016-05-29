describe('mapController', function() {
	var scope;
	var geoFactory;
	var passPromise;

	beforeEach(angular.mock.module('mapModule'));

	beforeEach(function() {
		angular.mock.module(function($provide) {
			$provide.factory('geoFactory', ['$q', function($q){
				function getCurrentPosition() {
					var position = {
						coords: {
							accuracy: 3012,
							altitude: null,
							altitudeAccuracy: null,
							heading: null,
							latitude: 51.5412621,
							longitude: -0.08813879999999999,
							speed: null
						},
						timestamp: 1464474395438
					};

					if (passPromise) {
						return $q.when(position);
					} else {
						return $q.reject('Error');
					}
				}

				return {
					getCurrentPosition: getCurrentPosition
				};
			}]);
		});
	});

	beforeEach(inject(function($rootScope, $controller, geoFactory) {
		scope = $rootScope.$new();
		mockGeoFactory = geoFactory;

		spyOn(mockGeoFactory, 'getCurrentPosition').and.callThrough();

		$controller('MapController', {
			$scope: scope,
			geoFactory: mockGeoFactory
		});
	}));

	// it('should have a method to get the current position', function() {
	// 	expect(scope.getPosition).toBeDefined();
	// });

	it('should get the position of the user', function() {
		passPromise = true;

		mockGeoFactory.getCurrentPosition().then(function(position) {
			scope.position = position;
		});
		scope.$digest();

		expect(scope.position).toBeDefined();
		expect(scope.position.coords).toBeDefined();
		expect(scope.position.coords.latitude).toBe(51.5412621);
	});

});