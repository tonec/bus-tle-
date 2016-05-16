module.exports = angular.module('App.uiMapDirective', [])

.directive('uiMap', function() {
	console.log('shjdhfkljsdhfjhsdf');
	return {
		restrict: 'E',
		template: '<div id="gmaps">GOOGLE MAP</div>',
		replace: true
	};
});