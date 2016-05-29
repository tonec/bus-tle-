describe('busstopsFactory', function() {
	var busstopsFactory;

	beforeEach(angular.mock.module('factories'));

	beforeEach(inject(function(_busstopsFactory_) {
		busstopsFactory = _busstopsFactory_;
	}));

	it('should be defined.', function() {
		expect(busstopsFactory).toBeDefined();
	});

});