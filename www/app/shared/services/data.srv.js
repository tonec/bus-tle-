(function() {

	angular.module('bustleApp.services')
		.service('dataService', DataService);

	function DataService() {
		return {
			busStopsData: null,
			stops: null
		};
	}

})();


