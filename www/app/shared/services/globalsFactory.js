module.exports = angular.module('bustleApp.services')
	.factory('globalsFactory', globalsFactory);

function globalsFactory() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
}