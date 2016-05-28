describe('geoFactory', function() {
	var geoFactory;

	beforeEach(angular.mock.module('factories'));

	beforeEach(inject(function(_geoFactory_) {
		geoFactory = _geoFactory_;
	}));

	it('should be defined.', function() {
		expect(geoFactory).toBeDefined();
	});

});