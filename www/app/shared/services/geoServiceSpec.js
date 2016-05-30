describe('geoService', function() {
	var geoService;

	beforeEach(angular.mock.module('bustleApp.services'));

	beforeEach(inject(function(_geoService_) {
		geoService = _geoService_;
	}));

	it('should be defined.', function() {
		expect(geoService).toBeDefined();
	});
});