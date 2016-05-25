describe('globalsFactory', function() {

	beforeEach(function() {
		angular.mock.module('factories');
	});

	it('should be defined.', inject(function(globalsFactory) {
		expect(globalsFactory).toBeDefined();
	}));

});