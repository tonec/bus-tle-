describe('Init testing', function() {

	it('should work', function() {
		angular.mock.module('bustleApp')

		expect(bustleApp).toBeTruthy();
	});

});