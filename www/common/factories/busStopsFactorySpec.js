describe('busstopsFactory', function() {

	beforeEach(angular.mock.module('factories'));

	it('should be defined.', inject(function(busstopsFactory) {
		expect(busstopsFactory).toBeDefined();
	}));

});