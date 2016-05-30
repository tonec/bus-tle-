(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('bustleApp.services', []);
angular.module('bustleApp.mapModule', []);
angular.module('bustleApp.moreModule', []);

require('../common/services/globalsFactory');
require('../common/services/geoService');
require('../common/services/busStopsService');
require('./map/mapController');
require('./map/mapDirective');
require('./more/moreController');

angular.module('bustleApp', [
	'ionic',
	'bustleApp.services',
	'bustleApp.mapModule',
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

},{"../common/services/busStopsService":5,"../common/services/geoService":6,"../common/services/globalsFactory":7,"./map/mapController":2,"./map/mapDirective":3,"./more/moreController":4}],2:[function(require,module,exports){
module.exports = angular.module('bustleApp.mapModule')
	.controller('MapController', MapController);

/* ngInject */
function MapController(geoService, busStopsService) {
	var mapVm = this;

	this.position = {};
	this.busStops = {};
	this.error = '';

	this.init = function() {
		mapVm.getPosition();
	};

	this.getPosition = function() {
		geoService.getCurrentPosition()
			.then(function(position) {
				mapVm.position = position;
				mapVm.getBusStopsNearby();
			})
			.catch(function() {
				mapVm.error = 'There has been an error.';
			});
	};

	this.getBusStopsNearby = function() {
		var coords = mapVm.position.coords;

		busStopsService.getLocal(coords)
			.then(function(response) {
				mapVm.busStops = response;
				mapVm.buildMap();
			})
			.catch(function() {
				mapVm.error = 'There has been an error.';
			});
	};

	this.buildMap = function() {
		var data = mapVm.busStops.data;
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
},{}],3:[function(require,module,exports){
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
				console.log('changed');
				setMarkers();
				map.fitBounds(bounds);
				map.panToBounds(bounds);
			});
		}
	};
}
},{}],4:[function(require,module,exports){
module.exports = angular.module('bustleApp.moreModule')
	.controller('MoreController', MoreController);

/* ngInject */
function MoreController($scope) {}
},{}],5:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
	.service('busStopsService', busStopsService);

/* ngInject */
function busStopsService($http, $httpParamSerializer, globalsFactory) {
	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	};

	this.getLocal = function (coords) {
		return $http({
			method: 'GET',
			url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
		});
	};
}

},{}],6:[function(require,module,exports){
module.exports = angular.module('bustleApp.services')
	.service('geoService', geoService);

/* ngInject */
function geoService($q, $window, $rootScope) {
	this.getCurrentPosition = function() {
		var deferred = $q.defer();

		$window.navigator.geolocation.getCurrentPosition(function(position) {
			$rootScope.$apply(function() {
				deferred.resolve(position);
			});
		}, function(error) {
			$rootScope.$apply(function() {
				deferred.reject(error);
			});
		});

		return deferred.promise;
	};
}
},{}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvZ2VvU2VydmljZS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tYXBNb2R1bGUnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1vcmVNb2R1bGUnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9zZXJ2aWNlcy9nbG9iYWxzRmFjdG9yeScpO1xucmVxdWlyZSgnLi4vY29tbW9uL3NlcnZpY2VzL2dlb1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9zZXJ2aWNlcy9idXNTdG9wc1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4vbWFwL21hcENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vbWFwL21hcERpcmVjdGl2ZScpO1xucmVxdWlyZSgnLi9tb3JlL21vcmVDb250cm9sbGVyJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAnLCBbXG5cdCdpb25pYycsXG5cdCdidXN0bGVBcHAuc2VydmljZXMnLFxuXHQnYnVzdGxlQXBwLm1hcE1vZHVsZScsXG5cdCdidXN0bGVBcHAubW9yZU1vZHVsZSdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcblx0JGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG5cdFx0fVxuXHRcdGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG5cdFx0XHQvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG5cdFx0XHRTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG5cdC8vIElvbmljIHVzZXMgQW5ndWxhclVJIFJvdXRlciB3aGljaCB1c2VzIHRoZSBjb25jZXB0IG9mIHN0YXRlc1xuXHQvLyBMZWFybiBtb3JlIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlclxuXHQvLyBTZXQgdXAgdGhlIHZhcmlvdXMgc3RhdGVzIHdoaWNoIHRoZSBhcHAgY2FuIGJlIGluLlxuXHQvLyBFYWNoIHN0YXRlJ3MgY29udHJvbGxlciBjYW4gYmUgZm91bmQgaW4gY29udHJvbGxlcnMuanNcblx0JHN0YXRlUHJvdmlkZXJcblxuXHQvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG5cdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RhYnMvdGFicy5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01hcENvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdtYXBWbSdcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbW9yZVZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJylcblx0LmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBNYXBDb250cm9sbGVyKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIE1hcENvbnRyb2xsZXIoZ2VvU2VydmljZSwgYnVzU3RvcHNTZXJ2aWNlKSB7XG5cdHZhciBtYXBWbSA9IHRoaXM7XG5cblx0dGhpcy5wb3NpdGlvbiA9IHt9O1xuXHR0aGlzLmJ1c1N0b3BzID0ge307XG5cdHRoaXMuZXJyb3IgPSAnJztcblxuXHR0aGlzLmluaXQgPSBmdW5jdGlvbigpIHtcblx0XHRtYXBWbS5nZXRQb3NpdGlvbigpO1xuXHR9O1xuXG5cdHRoaXMuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRnZW9TZXJ2aWNlLmdldEN1cnJlbnRQb3NpdGlvbigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHRtYXBWbS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdFx0XHRtYXBWbS5nZXRCdXNTdG9wc05lYXJieSgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0bWFwVm0uZXJyb3IgPSAnVGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IuJztcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuZ2V0QnVzU3RvcHNOZWFyYnkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29vcmRzID0gbWFwVm0ucG9zaXRpb24uY29vcmRzO1xuXG5cdFx0YnVzU3RvcHNTZXJ2aWNlLmdldExvY2FsKGNvb3Jkcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdG1hcFZtLmJ1c1N0b3BzID0gcmVzcG9uc2U7XG5cdFx0XHRcdG1hcFZtLmJ1aWxkTWFwKCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRtYXBWbS5lcnJvciA9ICdUaGVyZSBoYXMgYmVlbiBhbiBlcnJvci4nO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5idWlsZE1hcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0gbWFwVm0uYnVzU3RvcHMuZGF0YTtcblx0XHR2YXIgbWFya2VycyA9IFtdO1xuXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoZGF0YS5sYXRpdHVkZSwgZGF0YS5sb25naXR1ZGUpLFxuXHRcdFx0em9vbTogMTAsXG5cdFx0XHRtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdFx0fTtcblxuXHRcdG1hcFZtLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblxuXHRcdFx0dmFyIExhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHR2YXIgbWFya2VyID0ge1xuXHRcdFx0XHRpZDogc3RvcC5hdGNvY29kZSxcblx0XHRcdFx0cG9zaXRpb246IExhdExuZyxcblx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHRcdFx0fTtcblxuXHRcdFx0bWFya2Vycy5wdXNoKG1hcmtlcik7XG5cdFx0fSk7XG5cblx0XHRtYXBWbS5tYXJrZXJzID0gbWFya2Vycztcblx0fTtcblxuXHR0aGlzLmluaXQoKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJylcblx0LmRpcmVjdGl2ZSgndWlNYXAnLCB1aU1hcCk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiB1aU1hcCgpIHtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcnMoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IG1hcmtlci5wb3NpdGlvbixcblx0XHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlci50aXRsZSxcblx0XHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuXHRcdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2VyLnBvc2l0aW9uKTtcblxuXHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zO1xuXG5cdFx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLiR3YXRjaChhdHRyLm1hcmtlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2hhbmdlZCcpO1xuXHRcdFx0XHRzZXRNYXJrZXJzKCk7XG5cdFx0XHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblx0XHRcdFx0bWFwLnBhblRvQm91bmRzKGJvdW5kcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1vcmVNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBNb3JlQ29udHJvbGxlcik7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBNb3JlQ29udHJvbGxlcigkc2NvcGUpIHt9IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LnNlcnZpY2UoJ2J1c1N0b3BzU2VydmljZScsIGJ1c1N0b3BzU2VydmljZSk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBidXNTdG9wc1NlcnZpY2UoJGh0dHAsICRodHRwUGFyYW1TZXJpYWxpemVyLCBnbG9iYWxzRmFjdG9yeSkge1xuXHR2YXIgZ2VuZXJhdGVRdWVyeU9iaiA9IGZ1bmN0aW9uKGNvb3Jkcykge1xuXHRcdHJldHVybiB7XG5cdFx0XHRsYXQ6IGNvb3Jkcy5sYXRpdHVkZSxcblx0XHRcdGxvbjogY29vcmRzLmxvbmdpdHVkZSxcblx0XHRcdGFwcF9rZXk6IGdsb2JhbHNGYWN0b3J5LmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHNGYWN0b3J5LmFwcF9pZFxuXHRcdH07XG5cdH07XG5cblx0dGhpcy5nZXRMb2NhbCA9IGZ1bmN0aW9uIChjb29yZHMpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogZ2xvYmFsc0ZhY3RvcnkuYXBpX3VybF9uZWFyICsgJz8nICsgJGh0dHBQYXJhbVNlcmlhbGl6ZXIoZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpKVxuXHRcdH0pO1xuXHR9O1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LnNlcnZpY2UoJ2dlb1NlcnZpY2UnLCBnZW9TZXJ2aWNlKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIGdlb1NlcnZpY2UoJHEsICR3aW5kb3csICRyb290U2NvcGUpIHtcblx0dGhpcy5nZXRDdXJyZW50UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0XHR9KTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0JHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHR9O1xufSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5zZXJ2aWNlcycpXG5cdC5mYWN0b3J5KCdnbG9iYWxzRmFjdG9yeScsIGdsb2JhbHNGYWN0b3J5KTtcblxuZnVuY3Rpb24gZ2xvYmFsc0ZhY3RvcnkoKSB7XG5cdHJldHVybiB7XG5cdFx0YXBwX2lkOiAnODc5OTA5NjYnLFxuXHRcdGFwcF9rZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpX3VybF9uZWFyOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0iXX0=
