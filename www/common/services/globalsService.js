module.exports = angular.module('mapApp.globalsService', [])

.service('globalsService', function() {
	return {
		appId: '87990966',
		apiKey: '33a5cf9e54fa727537e4941cb04d81c4',
		apiUrl: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});