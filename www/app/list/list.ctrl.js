(function() {

	angular.module('bustleApp.listModule')
		.controller('ListController', ListController);

	function ListController(geoService, busStopsService, dataService) {
		var listVm = this;

		this.position = null;
		this.busStopsData = null;
		this.stops = null;
		this.error = null;

		this.init = function() {
			if (dataService.busStopsData) {
				listVm.busStopsData = dataService.busStopsData;
				listVm.stops = listVm.busStopsData.data.stops;
			} else {
				listVm.getPosition();
			}
		};

		this.getPosition = function() {
			geoService.getCurrentPosition()
				.then(function(position) {
					listVm.position = position;
					listVm.getBusStopsNearby();
				})
				.catch(function(error) {
					listVm.error = error;
				});
		};

		this.getBusStopsNearby = function() {
			var coords = listVm.position.coords;

			busStopsService.getLocal(coords)
				.then(function(response) {
					listVm.busStopsData = dataService.busStopsData = response;
					listVm.stops = response.data.stops;
				})
				.catch(function(error) {
					listVm.error = error;
				});
		};

		this.init();
	}

})();