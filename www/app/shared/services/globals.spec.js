describe('globals', function() {

	beforeEach(angular.mock.module('bustleApp.services'));

	it('should be defined.', inject(function(globals) {
		expect(globals).toBeDefined();
	}));

});