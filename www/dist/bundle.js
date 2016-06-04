(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bustleApp.services', []);
angular.module('bustleApp.mapModule', []);
angular.module('bustleApp.listModule', []);
angular.module('bustleApp.moreModule', []);

require('../app/shared/services/globals');
require('../app/shared/services/geoService');
require('../app/shared/services/busStopsService');
require('../app/shared/services/dataService');
require('../app/shared/directives/mapDirective');
require('../app/map/mapController');
require('../app/list/listController');
require('../app/more/moreController');

angular.module('bustleApp', [
	'ionic',
	'bustleApp.services',
	'bustleApp.mapModule',
	'bustleApp.listModule',
	'bustleApp.moreModule'
])

.run(["$ionicPlatform", function($ionicPlatform) {
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
}])

.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

	// Ionic uses AngularUI Router which uses the concept of states
	// Learn more here: https://github.com/angular-ui/ui-router
	// Set up the various states which the app can be in.
	// Each state's controller can be found in controllers.js
	$stateProvider

	// setup an abstract state for the tabs directive
	.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'app/tabs/tabs.html'
	})

	// Each tab has its own nav history stack:

	.state('tab.map', {
		url: '/map',
		views: {
			'tab-map': {
				templateUrl: 'app/map/views/index.html',
				controller: 'MapController',
				controllerAs: 'mapVm'
			}
		}
	})

	.state('tab.list', {
		url: '/list',
		views: {
			'tab-list': {
				templateUrl: 'app/list/views/index.html',
				controller: 'ListController',
				controllerAs: 'listVm'
			}
		}
	})

	.state('tab.more', {
		url: '/more',
		views: {
			'tab-more': {
				templateUrl: 'app/more/views/index.html',
				controller: 'MoreController',
				controllerAs: 'moreVm'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/map');

}]);

},{"../app/list/listController":2,"../app/map/mapController":3,"../app/more/moreController":4,"../app/shared/directives/mapDirective":5,"../app/shared/services/busStopsService":6,"../app/shared/services/dataService":7,"../app/shared/services/geoService":8,"../app/shared/services/globals":9}],2:[function(require,module,exports){
ListController.$inject = ["geoService", "busStopsService", "dataService"];
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
MapController.$inject = ["geoService", "busStopsService", "dataService"];
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
MoreController.$inject = ["$scope"];
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

						if (infoWindow !== void 0) {
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
busStopsService.$inject = ["$http", "$httpParamSerializer", "globals"];
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
geoService.$inject = ["$q", "$window", "$rootScope"];
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbGlzdC9saXN0Q29udHJvbGxlci5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL3NoYXJlZC9kaXJlY3RpdmVzL21hcERpcmVjdGl2ZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2RhdGFTZXJ2aWNlLmpzIiwid3d3L2FwcC9zaGFyZWQvc2VydmljZXMvZ2VvU2VydmljZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2dsb2JhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1hcE1vZHVsZScsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubGlzdE1vZHVsZScsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubW9yZU1vZHVsZScsIFtdKTtcblxucmVxdWlyZSgnLi4vYXBwL3NoYXJlZC9zZXJ2aWNlcy9nbG9iYWxzJyk7XG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL3NlcnZpY2VzL2dlb1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvc2VydmljZXMvYnVzU3RvcHNTZXJ2aWNlJyk7XG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL3NlcnZpY2VzL2RhdGFTZXJ2aWNlJyk7XG5yZXF1aXJlKCcuLi9hcHAvc2hhcmVkL2RpcmVjdGl2ZXMvbWFwRGlyZWN0aXZlJyk7XG5yZXF1aXJlKCcuLi9hcHAvbWFwL21hcENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4uL2FwcC9saXN0L2xpc3RDb250cm9sbGVyJyk7XG5yZXF1aXJlKCcuLi9hcHAvbW9yZS9tb3JlQ29udHJvbGxlcicpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnYnVzdGxlQXBwLnNlcnZpY2VzJyxcblx0J2J1c3RsZUFwcC5tYXBNb2R1bGUnLFxuXHQnYnVzdGxlQXBwLmxpc3RNb2R1bGUnLFxuXHQnYnVzdGxlQXBwLm1vcmVNb2R1bGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbWFwVm0nXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxuXG5cdC5zdGF0ZSgndGFiLmxpc3QnLCB7XG5cdFx0dXJsOiAnL2xpc3QnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLWxpc3QnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL2xpc3Qvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMaXN0Q29udHJvbGxlcicsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xpc3RWbSdcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbW9yZVZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubGlzdE1vZHVsZScpXG5cdC5jb250cm9sbGVyKCdMaXN0Q29udHJvbGxlcicsIExpc3RDb250cm9sbGVyKTtcblxuZnVuY3Rpb24gTGlzdENvbnRyb2xsZXIoZ2VvU2VydmljZSwgYnVzU3RvcHNTZXJ2aWNlLCBkYXRhU2VydmljZSkge1xuXHR2YXIgbGlzdFZtID0gdGhpcztcblxuXHR0aGlzLnBvc2l0aW9uID0gbnVsbDtcblx0dGhpcy5idXNTdG9wc0RhdGEgPSBudWxsO1xuXHR0aGlzLnN0b3BzID0gbnVsbDtcblx0dGhpcy5lcnJvciA9IG51bGw7XG5cblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YSkge1xuXHRcdFx0bGlzdFZtLmJ1c1N0b3BzRGF0YSA9IGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YTtcblx0XHRcdGxpc3RWbS5zdG9wcyA9IGxpc3RWbS5idXNTdG9wc0RhdGEuZGF0YS5zdG9wcztcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGlzdFZtLmdldFBvc2l0aW9uKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRnZW9TZXJ2aWNlLmdldEN1cnJlbnRQb3NpdGlvbigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHRsaXN0Vm0ucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHRcdFx0bGlzdFZtLmdldEJ1c1N0b3BzTmVhcmJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGxpc3RWbS5lcnJvciA9IGVycm9yO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5nZXRCdXNTdG9wc05lYXJieSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb29yZHMgPSBsaXN0Vm0ucG9zaXRpb24uY29vcmRzO1xuXG5cdFx0YnVzU3RvcHNTZXJ2aWNlLmdldExvY2FsKGNvb3Jkcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGxpc3RWbS5idXNTdG9wc0RhdGEgPSBkYXRhU2VydmljZS5idXNTdG9wc0RhdGEgPSByZXNwb25zZTtcblx0XHRcdFx0bGlzdFZtLnN0b3BzID0gcmVzcG9uc2UuZGF0YS5zdG9wcztcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0bGlzdFZtLmVycm9yID0gZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmluaXQoKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJylcblx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIE1hcENvbnRyb2xsZXIoZ2VvU2VydmljZSwgYnVzU3RvcHNTZXJ2aWNlLCBkYXRhU2VydmljZSkge1xuXHR2YXIgbWFwVm0gPSB0aGlzO1xuXG5cdHRoaXMucG9zaXRpb24gPSBudWxsO1xuXHR0aGlzLmJ1c1N0b3BzRGF0YSA9IG51bGw7XG5cdHRoaXMuc3RvcHMgPSBudWxsO1xuXHR0aGlzLmVycm9yID0gbnVsbDtcblxuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhKSB7XG5cdFx0XHRtYXBWbS5idXNTdG9wc0RhdGEgPSBkYXRhU2VydmljZS5idXNTdG9wc0RhdGE7XG5cdFx0XHRtYXBWbS5zdG9wcyA9IG1hcFZtLmJ1c1N0b3BzRGF0YS5kYXRhLnN0b3BzO1xuXHRcdFx0bWFwVm0uYnVpbGRNYXAoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWFwVm0uZ2V0UG9zaXRpb24oKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGdlb1NlcnZpY2UuZ2V0Q3VycmVudFBvc2l0aW9uKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdG1hcFZtLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0XHRcdG1hcFZtLmdldEJ1c1N0b3BzTmVhcmJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdG1hcFZtLmVycm9yID0gZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmdldEJ1c1N0b3BzTmVhcmJ5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvb3JkcyA9IG1hcFZtLnBvc2l0aW9uLmNvb3JkcztcblxuXHRcdGJ1c1N0b3BzU2VydmljZS5nZXRMb2NhbChjb29yZHMpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRtYXBWbS5idXNTdG9wc0RhdGEgPSBkYXRhU2VydmljZS5idXNTdG9wc0RhdGEgPSByZXNwb25zZTtcblx0XHRcdFx0bWFwVm0uYnVpbGRNYXAoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0bWFwVm0uZXJyb3IgPSBlcnJvcjtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuYnVpbGRNYXAgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YSA9IG1hcFZtLmJ1c1N0b3BzRGF0YS5kYXRhO1xuXHRcdHZhciBtYXJrZXJzID0gW107XG5cblx0XHR2YXIgbWFwT3B0aW9ucyA9IHtcblx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhkYXRhLmxhdGl0dWRlLCBkYXRhLmxvbmdpdHVkZSksXG5cdFx0XHR6b29tOiAxMCxcblx0XHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXG5cdFx0XHRzY3JvbGx3aGVlbDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0bWFwVm0ubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0XHRhbmd1bGFyLmZvckVhY2goZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXHRcdFx0dmFyIExhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXHRcdFx0dmFyIG1hcmtlciA9IHtcblx0XHRcdFx0aWQ6IHN0b3AuYXRjb2NvZGUsXG5cdFx0XHRcdHBvc2l0aW9uOiBMYXRMbmcsXG5cdFx0XHRcdHRpdGxlOiBzdG9wLm5hbWVcblx0XHRcdH07XG5cblx0XHRcdG1hcmtlcnMucHVzaChtYXJrZXIpO1xuXHRcdH0pO1xuXG5cdFx0bWFwVm0ubWFya2VycyA9IG1hcmtlcnM7XG5cdH07XG5cblx0dGhpcy5pbml0KCk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1vcmVNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBNb3JlQ29udHJvbGxlcik7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBNb3JlQ29udHJvbGxlcigkc2NvcGUpIHt9IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1hcE1vZHVsZScpXG5cdC5kaXJlY3RpdmUoJ3VpTWFwJywgdWlNYXApO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gdWlNYXAoKSB7XG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdFJyxcblx0XHR0ZW1wbGF0ZTogJzxkaXYgaWQ9XCJnbWFwc1wiIGNsYXNzPVwibWFwXCI+PC9kaXY+Jyxcblx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdHNjb3BlOiB7XG5cdFx0XHRvcHRpb25zOiAnPScsXG5cdFx0XHRtYXJrZXJzOiAnPSdcblx0XHR9LFxuXHRcdGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cikge1xuXHRcdFx0dmFyIG1hcDtcblx0XHRcdHZhciBpbmZvV2luZG93O1xuXHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcblx0XHRcdHZhciBtYXBPcHRpb25zID0gc2NvcGUub3B0aW9ucztcblx0XHRcdHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG5cblx0XHRcdChmdW5jdGlvbiBpbml0TWFwKCkge1xuXHRcdFx0XHRpZiAobWFwID09PSB2b2lkIDApIHtcblx0XHRcdFx0XHRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGVsZW1lbnRbMF0sIG1hcE9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSgpO1xuXG5cdFx0XHRmdW5jdGlvbiBzZXRNYXJrZXJzKCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goc2NvcGUubWFya2VycywgZnVuY3Rpb24obWFya2VyKSB7XG5cblx0XHRcdFx0XHR2YXIgbWFya2VyT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBtYXJrZXIucG9zaXRpb24sXG5cdFx0XHRcdFx0XHRtYXA6IG1hcCxcblx0XHRcdFx0XHRcdHRpdGxlOiBtYXJrZXIudGl0bGUsXG5cdFx0XHRcdFx0XHRpY29uOiAnaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vbWFwZmlsZXMvbXMvaWNvbnMvZ3JlZW4tZG90LnBuZydcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcblx0XHRcdFx0XHRib3VuZHMuZXh0ZW5kKG1hcmtlci5wb3NpdGlvbik7XG5cblx0XHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHZhciBpbmZvV2luZG93T3B0aW9ucztcblxuXHRcdFx0XHRcdFx0aWYgKGluZm9XaW5kb3cgIT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdFx0XHRpbmZvV2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3dPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRjb250ZW50OiBtYXJrZXIudGl0bGVcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyhpbmZvV2luZG93T3B0aW9ucyk7XG5cdFx0XHRcdFx0XHRpbmZvV2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRzY29wZS4kd2F0Y2goYXR0ci5tYXJrZXJzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2V0TWFya2VycygpO1xuXHRcdFx0XHRtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG5cdFx0XHRcdG1hcC5wYW5Ub0JvdW5kcyhib3VuZHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5mYWN0b3J5KCdidXNTdG9wc1NlcnZpY2UnLCBidXNTdG9wc1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gYnVzU3RvcHNTZXJ2aWNlKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFscykge1xuXG5cdHZhciBidXNTdG9wRGF0YSA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzLmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHMuYXBwX2lkXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldExvY2FsKGNvb3Jkcykge1xuXG5cdFx0Y29uc29sZS5sb2coZ2xvYmFscyk7XG5cdFx0dmFyIHVybCA9IGdsb2JhbHMuYXBpX3VybCArIGdsb2JhbHMuYXBpX2J1cy5uZWFyO1xuXG5cdFx0dmFyIGRhdGEgPSAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0dXJsOiB1cmwgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGJ1c1N0b3BEYXRhID0gZGF0YTtcblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRidXNTdG9wRGF0YTogYnVzU3RvcERhdGEsXG5cdFx0Z2V0TG9jYWw6IGdldExvY2FsXG5cdH07XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5zZXJ2aWNlKCdkYXRhU2VydmljZScsIERhdGFTZXJ2aWNlKTtcblxuZnVuY3Rpb24gRGF0YVNlcnZpY2UoKSB7XG5cdHJldHVybiB7XG5cdFx0YnVzU3RvcHNEYXRhOiBudWxsLFxuXHRcdHN0b3BzOiBudWxsXG5cdH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnKVxuXHQuZmFjdG9yeSgnZ2VvU2VydmljZScsIGdlb1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gZ2VvU2VydmljZSgkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXG5cdHZhciBwb3NpdGlvbiA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2V0Q3VycmVudFBvc2l0aW9uKCkge1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblxuXHRcdGRlZmVycmVkLnByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRwb3NpdGlvbiA9IGRhdGE7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZ2V0Q3VycmVudFBvc2l0aW9uXG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmNvbnN0YW50KCdnbG9iYWxzJywge1xuXHRcdGFwcF9pZDogJzg3OTkwOTY2Jyxcblx0XHRhcHBfa2V5OiAnMzNhNWNmOWU1NGZhNzI3NTM3ZTQ5NDFjYjA0ZDgxYzQnLFxuXHRcdGFwaV91cmw6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92MycsXG5cdFx0YXBpX2J1czoge1xuXHRcdFx0bmVhcjogJy91ay9idXMvc3RvcHMvbmVhci5qc29uJyxcblx0XHRcdGxpdmU6ICcvdWsvYnVzL3N0b3Ave2F0Y29jb2RlfS9saXZlLmpzb24nLFxuXHRcdFx0dGltZXRhYmxlOiAnL3VrL2J1cy9zdG9wL3thdGNvY29kZX0ve2RhdGV9L3t0aW1lfS90aW1ldGFibGUuanNvbicsXG5cdFx0XHRyb3V0ZTogJy91ay9idXMvcm91dGUve29wZXJhdG9yfS97bGluZX0ve2RpcmVjdGlvbn0ve2F0Y29jb2RlfS97ZGF0ZX0ve3RpbWV9L3RpbWV0YWJsZS5qc29uJyxcblx0XHRcdGJib3g6ICcvdWsvYnVzL3N0b3BzL2Jib3guanNvbidcblx0XHR9LFxuXHRcdGFwaV90dWJlOiB7XG5cdFx0XHRuZWFyOiAnL3VrL3R1YmUvc3RhdGlvbnMvbmVhci5qc29uJyxcblx0XHRcdGJib3g6ICcvdWsvdHViZS9zdGF0aW9ucy9iYm94Lmpzb24nXG5cdFx0fSxcblx0XHRhcGlfam91cm5leToge1xuXHRcdFx0ZnJvbVRvOiAnL3VrL3B1YmxpYy9qb3VybmV5L2Zyb20ve2Zyb219L3RvL3t0b30uanNvbicsXG5cdFx0XHRmcm9tVG9UeXBlOiAnL3VrL3B1YmxpYy9qb3VybmV5L2Zyb20ve2Zyb219L3RvL3t0b30ve3R5cGV9L3tkYXRlfS97dGltZX0uanNvbidcblx0XHR9XG5cdH0pOyJdfQ==
