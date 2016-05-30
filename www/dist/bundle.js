(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bustleApp.services', []);
angular.module('bustleApp.mapModule', []);
angular.module('bustleApp.listModule', []);
angular.module('bustleApp.moreModule', []);

require('../app/shared/services/globalsFactory');
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

});

},{"../app/list/listController":2,"../app/map/mapController":3,"../app/more/moreController":4,"../app/shared/directives/mapDirective":5,"../app/shared/services/busStopsService":6,"../app/shared/services/dataService":7,"../app/shared/services/geoService":8,"../app/shared/services/globalsFactory":9}],2:[function(require,module,exports){
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
module.exports = angular.module('bustleApp.services')
	.factory('busStopsService', busStopsService);

/* ngInject */
function busStopsService($http, $httpParamSerializer, globalsFactory) {

	var busStopData = null;

	function generateQueryObj(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	}

	function getLocal(coords) {
		var data = $http({
			method: 'GET',
			url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
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
	.factory('globalsFactory', globalsFactory);

function globalsFactory() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
}
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbGlzdC9saXN0Q29udHJvbGxlci5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL3NoYXJlZC9kaXJlY3RpdmVzL21hcERpcmVjdGl2ZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2RhdGFTZXJ2aWNlLmpzIiwid3d3L2FwcC9zaGFyZWQvc2VydmljZXMvZ2VvU2VydmljZS5qcyIsInd3dy9hcHAvc2hhcmVkL3NlcnZpY2VzL2dsb2JhbHNGYWN0b3J5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tYXBNb2R1bGUnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLmxpc3RNb2R1bGUnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1vcmVNb2R1bGUnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvc2VydmljZXMvZ2xvYmFsc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvc2VydmljZXMvZ2VvU2VydmljZScpO1xucmVxdWlyZSgnLi4vYXBwL3NoYXJlZC9zZXJ2aWNlcy9idXNTdG9wc1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvc2VydmljZXMvZGF0YVNlcnZpY2UnKTtcbnJlcXVpcmUoJy4uL2FwcC9zaGFyZWQvZGlyZWN0aXZlcy9tYXBEaXJlY3RpdmUnKTtcbnJlcXVpcmUoJy4uL2FwcC9tYXAvbWFwQ29udHJvbGxlcicpO1xucmVxdWlyZSgnLi4vYXBwL2xpc3QvbGlzdENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4uL2FwcC9tb3JlL21vcmVDb250cm9sbGVyJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAnLCBbXG5cdCdpb25pYycsXG5cdCdidXN0bGVBcHAuc2VydmljZXMnLFxuXHQnYnVzdGxlQXBwLm1hcE1vZHVsZScsXG5cdCdidXN0bGVBcHAubGlzdE1vZHVsZScsXG5cdCdidXN0bGVBcHAubW9yZU1vZHVsZSdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcblx0JGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG5cdFx0fVxuXHRcdGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG5cdFx0XHQvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG5cdFx0XHRTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG5cdC8vIElvbmljIHVzZXMgQW5ndWxhclVJIFJvdXRlciB3aGljaCB1c2VzIHRoZSBjb25jZXB0IG9mIHN0YXRlc1xuXHQvLyBMZWFybiBtb3JlIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlclxuXHQvLyBTZXQgdXAgdGhlIHZhcmlvdXMgc3RhdGVzIHdoaWNoIHRoZSBhcHAgY2FuIGJlIGluLlxuXHQvLyBFYWNoIHN0YXRlJ3MgY29udHJvbGxlciBjYW4gYmUgZm91bmQgaW4gY29udHJvbGxlcnMuanNcblx0JHN0YXRlUHJvdmlkZXJcblxuXHQvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG5cdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RhYnMvdGFicy5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01hcENvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdtYXBWbSdcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubGlzdCcsIHtcblx0XHR1cmw6ICcvbGlzdCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbGlzdCc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbGlzdC92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xpc3RDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbGlzdFZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdtb3JlVm0nXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5saXN0TW9kdWxlJylcblx0LmNvbnRyb2xsZXIoJ0xpc3RDb250cm9sbGVyJywgTGlzdENvbnRyb2xsZXIpO1xuXG5mdW5jdGlvbiBMaXN0Q29udHJvbGxlcihnZW9TZXJ2aWNlLCBidXNTdG9wc1NlcnZpY2UsIGRhdGFTZXJ2aWNlKSB7XG5cdHZhciBsaXN0Vm0gPSB0aGlzO1xuXG5cdHRoaXMucG9zaXRpb24gPSBudWxsO1xuXHR0aGlzLmJ1c1N0b3BzRGF0YSA9IG51bGw7XG5cdHRoaXMuc3RvcHMgPSBudWxsO1xuXHR0aGlzLmVycm9yID0gbnVsbDtcblxuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRpZiAoZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhKSB7XG5cdFx0XHRsaXN0Vm0uYnVzU3RvcHNEYXRhID0gZGF0YVNlcnZpY2UuYnVzU3RvcHNEYXRhO1xuXHRcdFx0bGlzdFZtLnN0b3BzID0gbGlzdFZtLmJ1c1N0b3BzRGF0YS5kYXRhLnN0b3BzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsaXN0Vm0uZ2V0UG9zaXRpb24oKTtcblx0XHR9XG5cdH07XG5cblx0dGhpcy5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGdlb1NlcnZpY2UuZ2V0Q3VycmVudFBvc2l0aW9uKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdGxpc3RWbS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdFx0XHRsaXN0Vm0uZ2V0QnVzU3RvcHNOZWFyYnkoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0bGlzdFZtLmVycm9yID0gZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmdldEJ1c1N0b3BzTmVhcmJ5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvb3JkcyA9IGxpc3RWbS5wb3NpdGlvbi5jb29yZHM7XG5cblx0XHRidXNTdG9wc1NlcnZpY2UuZ2V0TG9jYWwoY29vcmRzKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0bGlzdFZtLmJ1c1N0b3BzRGF0YSA9IGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRsaXN0Vm0uc3RvcHMgPSByZXNwb25zZS5kYXRhLnN0b3BzO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRsaXN0Vm0uZXJyb3IgPSBlcnJvcjtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuaW5pdCgpO1xufSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tYXBNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIE1hcENvbnRyb2xsZXIpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gTWFwQ29udHJvbGxlcihnZW9TZXJ2aWNlLCBidXNTdG9wc1NlcnZpY2UsIGRhdGFTZXJ2aWNlKSB7XG5cdHZhciBtYXBWbSA9IHRoaXM7XG5cblx0dGhpcy5wb3NpdGlvbiA9IG51bGw7XG5cdHRoaXMuYnVzU3RvcHNEYXRhID0gbnVsbDtcblx0dGhpcy5zdG9wcyA9IG51bGw7XG5cdHRoaXMuZXJyb3IgPSBudWxsO1xuXG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdGlmIChkYXRhU2VydmljZS5idXNTdG9wc0RhdGEpIHtcblx0XHRcdG1hcFZtLmJ1c1N0b3BzRGF0YSA9IGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YTtcblx0XHRcdG1hcFZtLnN0b3BzID0gbWFwVm0uYnVzU3RvcHNEYXRhLmRhdGEuc3RvcHM7XG5cdFx0XHRtYXBWbS5idWlsZE1hcCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtYXBWbS5nZXRQb3NpdGlvbigpO1xuXHRcdH1cblx0fTtcblxuXHR0aGlzLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2VvU2VydmljZS5nZXRDdXJyZW50UG9zaXRpb24oKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0bWFwVm0ucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHRcdFx0bWFwVm0uZ2V0QnVzU3RvcHNOZWFyYnkoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0bWFwVm0uZXJyb3IgPSBlcnJvcjtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuZ2V0QnVzU3RvcHNOZWFyYnkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29vcmRzID0gbWFwVm0ucG9zaXRpb24uY29vcmRzO1xuXG5cdFx0YnVzU3RvcHNTZXJ2aWNlLmdldExvY2FsKGNvb3Jkcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdG1hcFZtLmJ1c1N0b3BzRGF0YSA9IGRhdGFTZXJ2aWNlLmJ1c1N0b3BzRGF0YSA9IHJlc3BvbnNlO1xuXHRcdFx0XHRtYXBWbS5idWlsZE1hcCgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRtYXBWbS5lcnJvciA9IGVycm9yO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5idWlsZE1hcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0gbWFwVm0uYnVzU3RvcHNEYXRhLmRhdGE7XG5cdFx0dmFyIG1hcmtlcnMgPSBbXTtcblxuXHRcdHZhciBtYXBPcHRpb25zID0ge1xuXHRcdFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGRhdGEubGF0aXR1ZGUsIGRhdGEubG9uZ2l0dWRlKSxcblx0XHRcdHpvb206IDEwLFxuXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHRcdH07XG5cblx0XHRtYXBWbS5tYXBPcHRpb25zID0gbWFwT3B0aW9ucztcblxuXHRcdGFuZ3VsYXIuZm9yRWFjaChkYXRhLnN0b3BzLCBmdW5jdGlvbihzdG9wKSB7XG5cdFx0XHR2YXIgTGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhzdG9wLmxhdGl0dWRlLCBzdG9wLmxvbmdpdHVkZSk7XG5cdFx0XHR2YXIgbWFya2VyID0ge1xuXHRcdFx0XHRpZDogc3RvcC5hdGNvY29kZSxcblx0XHRcdFx0cG9zaXRpb246IExhdExuZyxcblx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHRcdFx0fTtcblxuXHRcdFx0bWFya2Vycy5wdXNoKG1hcmtlcik7XG5cdFx0fSk7XG5cblx0XHRtYXBWbS5tYXJrZXJzID0gbWFya2Vycztcblx0fTtcblxuXHR0aGlzLmluaXQoKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubW9yZU1vZHVsZScpXG5cdC5jb250cm9sbGVyKCdNb3JlQ29udHJvbGxlcicsIE1vcmVDb250cm9sbGVyKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIE1vcmVDb250cm9sbGVyKCRzY29wZSkge30iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJylcblx0LmRpcmVjdGl2ZSgndWlNYXAnLCB1aU1hcCk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiB1aU1hcCgpIHtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcnMoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IG1hcmtlci5wb3NpdGlvbixcblx0XHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlci50aXRsZSxcblx0XHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuXHRcdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2VyLnBvc2l0aW9uKTtcblxuXHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zO1xuXG5cdFx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLiR3YXRjaChhdHRyLm1hcmtlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRzZXRNYXJrZXJzKCk7XG5cdFx0XHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblx0XHRcdFx0bWFwLnBhblRvQm91bmRzKGJvdW5kcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmZhY3RvcnkoJ2J1c1N0b3BzU2VydmljZScsIGJ1c1N0b3BzU2VydmljZSk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBidXNTdG9wc1NlcnZpY2UoJGh0dHAsICRodHRwUGFyYW1TZXJpYWxpemVyLCBnbG9iYWxzRmFjdG9yeSkge1xuXG5cdHZhciBidXNTdG9wRGF0YSA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzRmFjdG9yeS5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzRmFjdG9yeS5hcHBfaWRcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0TG9jYWwoY29vcmRzKSB7XG5cdFx0dmFyIGRhdGEgPSAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0dXJsOiBnbG9iYWxzRmFjdG9yeS5hcGlfdXJsX25lYXIgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGF0YS50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdGJ1c1N0b3BEYXRhID0gZGF0YTtcblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRidXNTdG9wRGF0YTogYnVzU3RvcERhdGEsXG5cdFx0Z2V0TG9jYWw6IGdldExvY2FsXG5cdH07XG5cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5zZXJ2aWNlKCdkYXRhU2VydmljZScsIERhdGFTZXJ2aWNlKTtcblxuZnVuY3Rpb24gRGF0YVNlcnZpY2UoKSB7XG5cdHJldHVybiB7XG5cdFx0YnVzU3RvcHNEYXRhOiBudWxsLFxuXHRcdHN0b3BzOiBudWxsXG5cdH07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnKVxuXHQuZmFjdG9yeSgnZ2VvU2VydmljZScsIGdlb1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gZ2VvU2VydmljZSgkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXG5cdHZhciBwb3NpdGlvbiA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2V0Q3VycmVudFBvc2l0aW9uKCkge1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblxuXHRcdGRlZmVycmVkLnByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRwb3NpdGlvbiA9IGRhdGE7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZ2V0Q3VycmVudFBvc2l0aW9uXG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmZhY3RvcnkoJ2dsb2JhbHNGYWN0b3J5JywgZ2xvYmFsc0ZhY3RvcnkpO1xuXG5mdW5jdGlvbiBnbG9iYWxzRmFjdG9yeSgpIHtcblx0cmV0dXJuIHtcblx0XHRhcHBfaWQ6ICc4Nzk5MDk2NicsXG5cdFx0YXBwX2tleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlfdXJsX25lYXI6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSJdfQ==
