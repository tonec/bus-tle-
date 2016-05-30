describe('busStopsService', function() {
	var busStopsService;

	beforeEach(angular.mock.module('bustleApp.services'));

	beforeEach(inject(function(_busStopsService_) {
		busStopsService = _busStopsService_;
	}));

	it('should be defined.', function() {
		expect(busStopsService).toBeDefined();
	});

});