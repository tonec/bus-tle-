(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bustleApp.services', []);
angular.module('bustleApp.mapModule', []);
angular.module('bustleApp.listModule', []);
angular.module('bustleApp.moreModule', []);

require('../app/shared/services/globals');
require('../app/shared/services/geo.srv');
require('../app/shared/services/bus-stops.srv');
require('../app/shared/services/data.srv');
require('../app/shared/directives/map.drv');
require('../app/map/map.ctrl');
require('../app/list/list.ctrl');
require('../app/more/more.ctrl');

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

},{"../app/list/list.ctrl":2,"../app/map/map.ctrl":3,"../app/more/more.ctrl":4,"../app/shared/directives/map.drv":5,"../app/shared/services/bus-stops.srv":6,"../app/shared/services/data.srv":7,"../app/shared/services/geo.srv":8,"../app/shared/services/globals":9}],2:[function(require,module,exports){
module.exports = angular.module('bustleApp.listModule')
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
},{}],3:[function(require,module,exports){
module.exports = angular.module('bustleApp.mapModule')
	.controller('MapController', MapController);

/* ngInject */
function MapController(geoService, busStopsService, dataService) {
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
		geoService.getCurrentPosition()
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

		busStopsService.getLocal(coords)
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

	this.init();
}
},{}],4:[function(require,module,exports){
module.exports = angular.module('bustleApp.moreModule')
	.controller('MoreController', MoreController);

/* ngInject */
function MoreController($scope) {}
},{}],5:[function(require,module,exports){
module.exports = angular.module('bustleApp.mapModule')
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

			scope.$watch(attr.markers, function() {
				setMarkers();
				map.fitBounds(bounds);
				map.panToBounds(bounds);
			});
		}
	};
}
},{}],6:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
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

	function getLocal(coords) {

		console.log(globals);
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
		getLocal: getLocal
	};

}

},{}],7:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
	.service('dataService', DataService);

function DataService() {
	return {
		busStopsData: null,
		stops: null
	};
}

},{}],8:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
	.factory('geoService', geoService);

/* ngInject */
function geoService($q, $window, $rootScope) {

	var position = null;

	function getCurrentPosition() {
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
		getCurrentPosition: getCurrentPosition
	};
}
},{}],9:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbGlzdC9saXN0LmN0cmwuanMiLCJ3d3cvYXBwL21hcC9tYXAuY3RybC5qcyIsInd3dy9hcHAvbW9yZS9tb3JlLmN0cmwuanMiLCJ3d3cvYXBwL3NoYXJlZC9kaXJlY3RpdmVzL21hcC5kcnYuanMiLCJ3d3cvYXBwL3NoYXJlZC9zZXJ2aWNlcy9idXMtc3RvcHMuc3J2LmpzIiwid3d3L2FwcC9zaGFyZWQvc2VydmljZXMvZGF0YS5zcnYuanMiLCJ3d3cvYXBwL3NoYXJlZC9zZXJ2aWNlcy9nZW8uc3J2LmpzIiwid3d3L2FwcC9zaGFyZWQvc2VydmljZXMvZ2xvYmFscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5saXN0TW9kdWxlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tb3JlTW9kdWxlJywgW10pO1xuXG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL3NlcnZpY2VzL2dsb2JhbHMnKTtcbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvc2VydmljZXMvZ2VvLnNydicpO1xucmVxdWlyZSgnLi4vYXBwL3NoYXJlZC9zZXJ2aWNlcy9idXMtc3RvcHMuc3J2Jyk7XG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL3NlcnZpY2VzL2RhdGEuc3J2Jyk7XG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL2RpcmVjdGl2ZXMvbWFwLmRydicpO1xucmVxdWlyZSgnLi4vYXBwL21hcC9tYXAuY3RybCcpO1xucmVxdWlyZSgnLi4vYXBwL2xpc3QvbGlzdC5jdHJsJyk7XG5yZXF1aXJlKCcuLi9hcHAvbW9yZS9tb3JlLmN0cmwnKTtcblxuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcCcsIFtcblx0J2lvbmljJyxcblx0J2J1c3RsZUFwcC5zZXJ2aWNlcycsXG5cdCdidXN0bGVBcHAubWFwTW9kdWxlJyxcblx0J2J1c3RsZUFwcC5saXN0TW9kdWxlJyxcblx0J2J1c3RsZUFwcC5tb3JlTW9kdWxlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuXHQkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cblx0XHR9XG5cdFx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHRcdC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcblx0XHRcdFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcblx0XHR9XG5cdH0pO1xufSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cblx0Ly8gSW9uaWMgdXNlcyBBbmd1bGFyVUkgUm91dGVyIHdoaWNoIHVzZXMgdGhlIGNvbmNlcHQgb2Ygc3RhdGVzXG5cdC8vIExlYXJuIG1vcmUgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyXG5cdC8vIFNldCB1cCB0aGUgdmFyaW91cyBzdGF0ZXMgd2hpY2ggdGhlIGFwcCBjYW4gYmUgaW4uXG5cdC8vIEVhY2ggc3RhdGUncyBjb250cm9sbGVyIGNhbiBiZSBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xuXHQkc3RhdGVQcm92aWRlclxuXG5cdC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcblx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGFicy90YWJzLnRwbC5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC9tYXAudHBsLmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTWFwQ29udHJvbGxlcicsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ21hcFZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5saXN0Jywge1xuXHRcdHVybDogJy9saXN0Jyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1saXN0Jzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9saXN0L2xpc3QudHBsLmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTGlzdENvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsaXN0Vm0nXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxuXG5cdC5zdGF0ZSgndGFiLm1vcmUnLCB7XG5cdFx0dXJsOiAnL21vcmUnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1vcmUnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21vcmUvbW9yZS50cGwuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNb3JlQ29udHJvbGxlcicsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ21vcmVWbSdcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG5cdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbWFwJyk7XG5cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLmxpc3RNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTGlzdENvbnRyb2xsZXInLCBMaXN0Q29udHJvbGxlcik7XG5cbmZ1bmN0aW9uIExpc3RDb250cm9sbGVyKGdlb1NlcnZpY2UsIGJ1c1N0b3BzU2VydmljZSwgZGF0YVNlcnZpY2UpIHtcblx0dmFyIGxpc3RWbSA9IHRoaXM7XG5cblx0dGhpcy5wb3NpdGlvbiA9IG51bGw7XG5cdHRoaXMuYnVzU3RvcHNEYXRhID0gbnVsbDtcblx0dGhpcy5zdG9wcyA9IG51bGw7XG5cdHRoaXMuZXJyb3IgPSBudWxsO1xuXG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChkYXRhU2VydmljZS5idXNTdG9wc0RhdGEpIHtcblx0XHRcdGxpc3RWbS5idXNTdG9wc0RhdGEgPSBkYXRhU2VydmljZS5idXNTdG9wc0RhdGE7XG5cdFx0XHRsaXN0Vm0uc3RvcHMgPSBsaXN0Vm0uYnVzU3RvcHNEYXRhLmRhdGEuc3RvcHM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxpc3RWbS5nZXRQb3NpdGlvbigpO1xuXHRcdH1cblx0fTtcblxuXHR0aGlzLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2VvU2VydmljZS5nZXRDdXJyZW50UG9zaXRpb24oKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0bGlzdFZtLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0XHRcdGxpc3RWbS5nZXRCdXNTdG9wc05lYXJieSgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRsaXN0Vm0uZXJyb3IgPSBlcnJvcjtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuZ2V0QnVzU3RvcHNOZWFyYnkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29vcmRzID0gbGlzdFZtLnBvc2l0aW9uLmNvb3JkcztcblxuXHRcdGJ1c1N0b3BzU2VydmljZS5nZXRMb2NhbChjb29yZHMpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRsaXN0Vm0uYnVzU3RvcHNEYXRhID0gZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhID0gcmVzcG9uc2U7XG5cdFx0XHRcdGxpc3RWbS5zdG9wcyA9IHJlc3BvbnNlLmRhdGEuc3RvcHM7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGxpc3RWbS5lcnJvciA9IGVycm9yO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5pbml0KCk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1hcE1vZHVsZScpXG5cdC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgTWFwQ29udHJvbGxlcik7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBNYXBDb250cm9sbGVyKGdlb1NlcnZpY2UsIGJ1c1N0b3BzU2VydmljZSwgZGF0YVNlcnZpY2UpIHtcblx0dmFyIG1hcFZtID0gdGhpcztcblxuXHR0aGlzLnBvc2l0aW9uID0gbnVsbDtcblx0dGhpcy5idXNTdG9wc0RhdGEgPSBudWxsO1xuXHR0aGlzLnN0b3BzID0gbnVsbDtcblx0dGhpcy5lcnJvciA9IG51bGw7XG5cblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YSkge1xuXHRcdFx0bWFwVm0uYnVzU3RvcHNEYXRhID0gZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhO1xuXHRcdFx0bWFwVm0uc3RvcHMgPSBtYXBWbS5idXNTdG9wc0RhdGEuZGF0YS5zdG9wcztcblx0XHRcdG1hcFZtLmJ1aWxkTWFwKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1hcFZtLmdldFBvc2l0aW9uKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRnZW9TZXJ2aWNlLmdldEN1cnJlbnRQb3NpdGlvbigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHRtYXBWbS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdFx0XHRtYXBWbS5nZXRCdXNTdG9wc05lYXJieSgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRtYXBWbS5lcnJvciA9IGVycm9yO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5nZXRCdXNTdG9wc05lYXJieSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb29yZHMgPSBtYXBWbS5wb3NpdGlvbi5jb29yZHM7XG5cblx0XHRidXNTdG9wc1NlcnZpY2UuZ2V0TG9jYWwoY29vcmRzKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0bWFwVm0uYnVzU3RvcHNEYXRhID0gZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhID0gcmVzcG9uc2U7XG5cdFx0XHRcdG1hcFZtLmJ1aWxkTWFwKCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdG1hcFZtLmVycm9yID0gZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmJ1aWxkTWFwID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRhdGEgPSBtYXBWbS5idXNTdG9wc0RhdGEuZGF0YTtcblx0XHR2YXIgbWFya2VycyA9IFtdO1xuXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoZGF0YS5sYXRpdHVkZSwgZGF0YS5sb25naXR1ZGUpLFxuXHRcdFx0em9vbTogMTAsXG5cdFx0XHRtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdFx0fTtcblxuXHRcdG1hcFZtLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblx0XHRcdHZhciBMYXRMbmcgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHN0b3AubGF0aXR1ZGUsIHN0b3AubG9uZ2l0dWRlKTtcblx0XHRcdHZhciBtYXJrZXIgPSB7XG5cdFx0XHRcdGlkOiBzdG9wLmF0Y29jb2RlLFxuXHRcdFx0XHRwb3NpdGlvbjogTGF0TG5nLFxuXHRcdFx0XHR0aXRsZTogc3RvcC5uYW1lXG5cdFx0XHR9O1xuXG5cdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHR9KTtcblxuXHRcdG1hcFZtLm1hcmtlcnMgPSBtYXJrZXJzO1xuXHR9O1xuXG5cdHRoaXMuaW5pdCgpO1xufSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tb3JlTW9kdWxlJylcblx0LmNvbnRyb2xsZXIoJ01vcmVDb250cm9sbGVyJywgTW9yZUNvbnRyb2xsZXIpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gTW9yZUNvbnRyb2xsZXIoJHNjb3BlKSB7fSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tYXBNb2R1bGUnKVxuXHQuZGlyZWN0aXZlKCd1aU1hcCcsIHVpTWFwKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIHVpTWFwKCkge1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IGlkPVwiZ21hcHNcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PicsXG5cdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRzY29wZToge1xuXHRcdFx0b3B0aW9uczogJz0nLFxuXHRcdFx0bWFya2VyczogJz0nXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHZhciBtYXA7XG5cdFx0XHR2YXIgaW5mb1dpbmRvdztcblx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cdFx0XHR2YXIgbWFwT3B0aW9ucyA9IHNjb3BlLm9wdGlvbnM7XG5cdFx0XHR2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuXG5cdFx0XHQoZnVuY3Rpb24gaW5pdE1hcCgpIHtcblx0XHRcdFx0aWYgKG1hcCA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0bWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChlbGVtZW50WzBdLCBtYXBPcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoKTtcblxuXHRcdFx0ZnVuY3Rpb24gc2V0TWFya2VycygpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHNjb3BlLm1hcmtlcnMsIGZ1bmN0aW9uKG1hcmtlcikge1xuXG5cdFx0XHRcdFx0dmFyIG1hcmtlck9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdFx0XHR0aXRsZTogbWFya2VyLnRpdGxlLFxuXHRcdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cdFx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR2YXIgaW5mb1dpbmRvd09wdGlvbnM7XG5cblx0XHRcdFx0XHRcdGlmICghaW5mb1dpbmRvdykge1xuXHRcdFx0XHRcdFx0XHRpbmZvV2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3dPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRjb250ZW50OiBtYXJrZXIudGl0bGVcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyhpbmZvV2luZG93T3B0aW9ucyk7XG5cdFx0XHRcdFx0XHRpbmZvV2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRzY29wZS4kd2F0Y2goYXR0ci5tYXJrZXJzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2V0TWFya2VycygpO1xuXHRcdFx0XHRtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG5cdFx0XHRcdG1hcC5wYW5Ub0JvdW5kcyhib3VuZHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5mYWN0b3J5KCdidXNTdG9wc1NlcnZpY2UnLCBidXNTdG9wc1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gYnVzU3RvcHNTZXJ2aWNlKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFscykge1xuXG5cdHZhciBidXNTdG9wRGF0YSA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzLmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHMuYXBwX2lkXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldExvY2FsKGNvb3Jkcykge1xuXG5cdFx0Y29uc29sZS5sb2coZ2xvYmFscyk7XG5cdFx0dmFyIHVybCA9IGdsb2JhbHMuYXBpX3VybCArIGdsb2JhbHMuYXBpX2J1cy5uZWFyO1xuXG5cdFx0dmFyIGRhdGEgPSAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0dXJsOiB1cmwgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGJ1c1N0b3BEYXRhID0gZGF0YTtcblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRidXNTdG9wRGF0YTogYnVzU3RvcERhdGEsXG5cdFx0Z2V0TG9jYWw6IGdldExvY2FsXG5cdH07XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5zZXJ2aWNlKCdkYXRhU2VydmljZScsIERhdGFTZXJ2aWNlKTtcblxuZnVuY3Rpb24gRGF0YVNlcnZpY2UoKSB7XG5cdHJldHVybiB7XG5cdFx0YnVzU3RvcHNEYXRhOiBudWxsLFxuXHRcdHN0b3BzOiBudWxsXG5cdH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnKVxuXHQuZmFjdG9yeSgnZ2VvU2VydmljZScsIGdlb1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gZ2VvU2VydmljZSgkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXG5cdHZhciBwb3NpdGlvbiA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2V0Q3VycmVudFBvc2l0aW9uKCkge1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblxuXHRcdGRlZmVycmVkLnByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRwb3NpdGlvbiA9IGRhdGE7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZ2V0Q3VycmVudFBvc2l0aW9uXG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmNvbnN0YW50KCdnbG9iYWxzJywge1xuXHRcdGFwcF9pZDogJzg3OTkwOTY2Jyxcblx0XHRhcHBfa2V5OiAnMzNhNWNmOWU1NGZhNzI3NTM3ZTQ5NDFjYjA0ZDgxYzQnLFxuXHRcdGFwaV91cmw6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92MycsXG5cdFx0YXBpX2J1czoge1xuXHRcdFx0bmVhcjogJy91ay9idXMvc3RvcHMvbmVhci5qc29uJyxcblx0XHRcdGxpdmU6ICcvdWsvYnVzL3N0b3Ave2F0Y29jb2RlfS9saXZlLmpzb24nLFxuXHRcdFx0dGltZXRhYmxlOiAnL3VrL2J1cy9zdG9wL3thdGNvY29kZX0ve2RhdGV9L3t0aW1lfS90aW1ldGFibGUuanNvbicsXG5cdFx0XHRyb3V0ZTogJy91ay9idXMvcm91dGUve29wZXJhdG9yfS97bGluZX0ve2RpcmVjdGlvbn0ve2F0Y29jb2RlfS97ZGF0ZX0ve3RpbWV9L3RpbWV0YWJsZS5qc29uJyxcblx0XHRcdGJib3g6ICcvdWsvYnVzL3N0b3BzL2Jib3guanNvbidcblx0XHR9LFxuXHRcdGFwaV90dWJlOiB7XG5cdFx0XHRuZWFyOiAnL3VrL3R1YmUvc3RhdGlvbnMvbmVhci5qc29uJyxcblx0XHRcdGJib3g6ICcvdWsvdHViZS9zdGF0aW9ucy9iYm94Lmpzb24nXG5cdFx0fSxcblx0XHRhcGlfam91cm5leToge1xuXHRcdFx0ZnJvbVRvOiAnL3VrL3B1YmxpYy9qb3VybmV5L2Zyb20ve2Zyb219L3RvL3t0b30uanNvbicsXG5cdFx0XHRmcm9tVG9UeXBlOiAnL3VrL3B1YmxpYy9qb3VybmV5L2Zyb20ve2Zyb219L3RvL3t0b30ve3R5cGV9L3tkYXRlfS97dGltZX0uanNvbidcblx0XHR9XG5cdH0pOyJdfQ==
