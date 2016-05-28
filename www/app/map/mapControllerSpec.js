describe('mapController', function() {
	var scope;

	beforeEach(angular.mock.module('mapModule'));

	beforeEach(inject(function($rootScope, $controller) {
		scope = $rootScope.$new();

		createController = function() {
			return $controller('MapController', {
				$scope: scope
			});
		};
	}));

	it('should have a variable called location', function() {
		var controller = createController();

		expect(scope.location).toBe('here i am');
	});

});