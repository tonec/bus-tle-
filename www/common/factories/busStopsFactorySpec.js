describe('busstopsFactory', function() {

	beforeEach(function() {
		angular.mock.module('factories');
	});

	it('should be defined.', inject(function(busstopsFactory) {
		expect(busstopsFactory).toBeDefined();
	}));

});