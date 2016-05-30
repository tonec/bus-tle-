describe('globalsFactory', function() {

	beforeEach(angular.mock.module('bustleApp.services'));

	it('should be defined.', inject(function(globalsFactory) {
		expect(globalsFactory).toBeDefined();
	}));

});