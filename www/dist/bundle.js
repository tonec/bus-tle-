(function() {
	'use strict';

	angular.module('bustleApp.services', []);
	angular.module('bustleApp.mapModule', []);
	angular.module('bustleApp.listModule', []);
	angular.module('bustleApp.moreModule', []);

	angular.module('bustleApp', [
		'ionic',
		'bustleApp.services',
		'bustleApp.mapModule',
		'bustleApp.listModule',
		'bustleApp.moreModule'
	])

	.run(function($ionicPlatform) {
		$ionicPlatform.ready(function() {
			if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
				cordova.plugins.Keyboard.disableScroll(true);

			}
			if (window.StatusBar) {
				// org.apache.cordova.statusbar required
				StatusBar.styleDefault();
			}
		});
	})

	.config(function($stateProvider, $urlRouterProvider) {

		// Ionic uses AngularUI Router which uses the concept of states
		// Learn more here: https://github.com/angular-ui/ui-router
		// Set up the various states which the app can be in.
		// Each state's controller can be found in controllers.js
		$stateProvider

		// setup an abstract state for the tabs directive
		.state('tab', {
			url: '/tab',
			abstract: true,
			templateUrl: 'app/tabs/tabs.tpl.html'
		})

		// Each tab has its own nav history stack:

		.state('tab.map', {
			url: '/map',
			views: {
				'tab-map': {
					templateUrl: 'app/map/map.tpl.html',
					controller: 'MapController',
					controllerAs: 'mapVm'
				}
			}
		})

		.state('tab.list', {
			url: '/list',
			views: {
				'tab-list': {
					templateUrl: 'app/list/list.tpl.html',
					controller: 'ListController',
					controllerAs: 'listVm'
				}
			}
		})

		.state('tab.more', {
			url: '/more',
			views: {
				'tab-more': {
					templateUrl: 'app/more/more.tpl.html',
					controller: 'MoreController',
					controllerAs: 'moreVm'
				}
			}
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/tab/map');

	});

})();


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
			geoService.gettingCurrentPosition()
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

			busStopsService.gettingLocal(coords)
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
(function() {

	angular.module('bustleApp.mapModule')
		.controller('MapController', MapController);

	/* ngInject */
	function MapController($scope, geoService, busStopsService, dataService) {
		var mapVm = this;

		this.position = null;
		this.busStopsData = null;
		this.stops = null;
		this.error = null;

		this.init = function() {
			if (dataService.busStopsData) {
				mapVm.busStopsData = dataService.busStopsData;
				mapVm.stops = mapVm.busStopsData.data.stops;
				mapVm.buildMap();
			} else {
				mapVm.getPosition();
			}
		};

		this.getPosition = function() {
			geoService.gettingCurrentPosition()
				.then(function(position) {
					mapVm.position = position;
					mapVm.getBusStopsNearby();
				})
				.catch(function(error) {
					mapVm.error = error;
				});
		};

		this.getBusStopsNearby = function() {
			var coords = mapVm.position.coords;

			busStopsService.gettingLocal(coords)
				.then(function(response) {
					mapVm.busStopsData = dataService.busStopsData = response;
					mapVm.buildMap();
				})
				.catch(function(error) {
					mapVm.error = error;
				});
		};

		this.buildMap = function() {
			var data = mapVm.busStopsData.data;
			var markers = [];

			var mapOptions = {
				center: new google.maps.LatLng(data.latitude, data.longitude),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: false
			};

			mapVm.mapOptions = mapOptions;

			angular.forEach(data.stops, function(stop) {
				var LatLng = new google.maps.LatLng(stop.latitude, stop.longitude);
				var marker = {
					id: stop.atcocode,
					position: LatLng,
					title: stop.name
				};

				markers.push(marker);
			});

			mapVm.markers = markers;
		};

		this.refresh = function() {
			console.log('refresh');
			$scope.$broadcast('refresh-map');
		};

		this.init();
	}

})();
(function() {

	angular.module('bustleApp.moreModule')
		.controller('MoreController', MoreController);

	/* ngInject */
	function MoreController($scope) {}

})();
(function() {

	angular.module('bustleApp.mapModule')
		.directive('uiMap', uiMap);

	/* ngInject */
	function uiMap() {
		return {
			restrict: 'E',
			template: '<div id="gmaps" class="map"></div>',
			replace: true,
			scope: {
				options: '=',
				markers: '='
			},
			link: function (scope, element, attr) {
				var map;
				var infoWindow;
				var markers = [];
				var mapOptions = scope.options;
				var bounds = new google.maps.LatLngBounds();

				(function initMap() {
					if (map === void 0) {
						map = new google.maps.Map(element[0], mapOptions);
					}
				})();

				function setMarkers() {
					angular.forEach(scope.markers, function(marker) {

						var markerOptions = {
							position: marker.position,
							map: map,
							title: marker.title,
							icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
						};

						marker = new google.maps.Marker(markerOptions);
						bounds.extend(marker.position);

						google.maps.event.addListener(marker, 'click', function () {
							var infoWindowOptions;

							if (!infoWindow) {
								infoWindow.close();
							}

							infoWindowOptions = {
								content: marker.title
							};

							infoWindow = new google.maps.InfoWindow(infoWindowOptions);
							infoWindow.open(map, marker);
						});

					});
				}

				function resetBounds() {
					map.fitBounds(bounds);
					map.panToBounds(bounds);
				}

				scope.$on('refresh-map', function() {
					resetBounds();
				});

				scope.$watch(attr.markers, function() {
					setMarkers();
					resetBounds();
				});
			}
		};
	}

})();
(function() {

	angular.module('bustleApp.services')
		.factory('busStopsService', busStopsService);

	/* ngInject */
	function busStopsService($http, $httpParamSerializer, globals) {

		var busStopData = null;

		function generateQueryObj(coords) {
			return {
				lat: coords.latitude,
				lon: coords.longitude,
				app_key: globals.app_key,
				app_id: globals.app_id
			};
		}

		function gettingLocal(coords) {
			var url = globals.api_url + globals.api_bus.near;

			var data = $http({
				method: 'GET',
				url: url + '?' + $httpParamSerializer(generateQueryObj(coords))
			});

			return data.then(function(data) {
				busStopData = data;
				return data;
			});
		}

		return {
			busStopData: busStopData,
			gettingLocal: gettingLocal
		};

	}

})();


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



(function() {

	angular.module('bustleApp.services')
		.factory('geoService', geoService);

	/* ngInject */
	function geoService($q, $window, $rootScope) {

		var position = null;

		function gettingCurrentPosition() {
			var deferred = $q.defer();

			$window.navigator.geolocation.getCurrentPosition(function(data) {
				deferred.resolve(data);
			}, function(error) {
				deferred.reject(error);
			});

			deferred.promise.then(function(data) {
				position = data;
			});

			return deferred.promise;
		}

		return {
			position: position,
			gettingCurrentPosition: gettingCurrentPosition
		};
	}

})();
(function() {

	angular.module('bustleApp.services')
		.constant('globals', {
			app_id: '87990966',
			app_key: '33a5cf9e54fa727537e4941cb04d81c4',
			api_url: 'http://transportapi.com/v3',
			api_bus: {
				near: '/uk/bus/stops/near.json',
				live: '/uk/bus/stop/{atcocode}/live.json',
				timetable: '/uk/bus/stop/{atcocode}/{date}/{time}/timetable.json',
				route: '/uk/bus/route/{operator}/{line}/{direction}/{atcocode}/{date}/{time}/timetable.json',
				bbox: '/uk/bus/stops/bbox.json'
			},
			api_tube: {
				near: '/uk/tube/stations/near.json',
				bbox: '/uk/tube/stations/bbox.json'
			},
			api_journey: {
				fromTo: '/uk/public/journey/from/{from}/to/{to}.json',
				fromToType: '/uk/public/journey/from/{from}/to/{to}/{type}/{date}/{time}.json'
			}
		});

})();