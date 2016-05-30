module.exports = angular.module('bustleApp.listModule')
	.controller('ListController', ListController);

function ListController(geoService, busStopsService) {
	var listVm = this;

	this.position = {};
	this.busStops = {};
	this.error = '';

	this.init = function() {
		listVm.getPosition();
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
				listVm.busStops = response.data.stops;
				console.log(listVm.busStops);
			})
			.catch(function(error) {
				listVm.error = error;
			});
	};

	this.init();
}