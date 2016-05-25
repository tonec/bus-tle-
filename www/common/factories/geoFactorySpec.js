describe('geoFactory', function() {

	beforeEach(angular.mock.module('factories'));

	it('should be defined.', inject(function(geoFactory) {
		expect(geoFactory).toBeDefined();
	}));

});