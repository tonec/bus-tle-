describe('geoFactory', function() {

	beforeEach(function() {
		angular.mock.module('factories');
	});

	it('should be defined.', inject(function(geoFactory) {
		expect(geoFactory).toBeDefined();
	}));

});