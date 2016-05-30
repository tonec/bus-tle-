(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('factories', []);
angular.module('services', []);
angular.module('mapModule', []);
angular.module('moreModule', []);

require('../common/factories/globalsFactory');
require('../common/services/geoService');
require('../common/services/busStopsService');
require('./map/mapController');
require('./map/mapDirective');
require('./more/moreController');

angular.module('bustleApp', [
	'ionic',
	'services',
	'factories',
	'mapModule',
	'moreModule'
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

},{"../common/factories/globalsFactory":5,"../common/services/busStopsService":6,"../common/services/geoService":7,"./map/mapController":2,"./map/mapDirective":3,"./more/moreController":4}],2:[function(require,module,exports){
module.exports = angular.module('mapModule')
	.controller('MapController', MapController);

/* ngInject */
function MapController($scope, geoService, busStopsService) {
	'ngInject';

	$scope.position = {};
	$scope.busStops = {};
	$scope.error = '';

	this.init = function() {
		$scope.getPosition = this.getPosition;
		$scope.getBusStopsNearby = this.getBusStopsNearby;
		$scope.buildMap = this.buildMap;

		this.getPosition();
	};

	this.getPosition = function() {
		geoService.getCurrentPosition()
			.then(function(position) {
				$scope.position = position;
				$scope.getBusStopsNearby();
			})
			.catch(function() {
				$scope.error = 'There has been an error.';
			});
	};

	this.getBusStopsNearby = function() {
		var coords = $scope.position.coords;

		busStopsService.getLocal(coords)
			.then(function(response) {
				$scope.busStops = response;
				$scope.buildMap();
			})
			.catch(function() {
				$scope.error = 'There has been an error.';
			});
	};

	this.buildMap = function() {
		var data = $scope.busStops.data;
		var markers = [];

		var mapOptions = {
			center: new google.maps.LatLng(data.latitude, data.longitude),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

		angular.forEach(data.stops, function(stop) {

			var LatLng = new google.maps.LatLng(stop.latitude, stop.longitude);

			var marker = {
				id: stop.atcocode,
				position: LatLng,
				title: stop.name
			};

			markers.push(marker);
		});

		$scope.markers = markers;
	};

	this.init();
}
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapModule')
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
module.exports = angular.module('moreModule')
	.controller('MoreController', MoreController);

/* ngInject */
function MoreController($scope) {}
},{}],5:[function(require,module,exports){
module.exports = angular.module('factories')
	.factory('globalsFactory', globalsFactory);

function globalsFactory() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
}
},{}],6:[function(require,module,exports){
module.exports = angular.module('services')
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

},{}],7:[function(require,module,exports){
module.exports = angular.module('services')
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nbG9iYWxzRmFjdG9yeS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvYnVzU3RvcHNTZXJ2aWNlLmpzIiwid3d3L2NvbW1vbi9zZXJ2aWNlcy9nZW9TZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ3NlcnZpY2VzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdtb3JlTW9kdWxlJywgW10pO1xuXG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2dsb2JhbHNGYWN0b3J5Jyk7XG5yZXF1aXJlKCcuLi9jb21tb24vc2VydmljZXMvZ2VvU2VydmljZScpO1xucmVxdWlyZSgnLi4vY29tbW9uL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZScpO1xucmVxdWlyZSgnLi9tYXAvbWFwQ29udHJvbGxlcicpO1xucmVxdWlyZSgnLi9tYXAvbWFwRGlyZWN0aXZlJyk7XG5yZXF1aXJlKCcuL21vcmUvbW9yZUNvbnRyb2xsZXInKTtcblxuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcCcsIFtcblx0J2lvbmljJyxcblx0J3NlcnZpY2VzJyxcblx0J2ZhY3RvcmllcycsXG5cdCdtYXBNb2R1bGUnLFxuXHQnbW9yZU1vZHVsZSdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcblx0JGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG5cdFx0fVxuXHRcdGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG5cdFx0XHQvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG5cdFx0XHRTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG5cdC8vIElvbmljIHVzZXMgQW5ndWxhclVJIFJvdXRlciB3aGljaCB1c2VzIHRoZSBjb25jZXB0IG9mIHN0YXRlc1xuXHQvLyBMZWFybiBtb3JlIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlclxuXHQvLyBTZXQgdXAgdGhlIHZhcmlvdXMgc3RhdGVzIHdoaWNoIHRoZSBhcHAgY2FuIGJlIGluLlxuXHQvLyBFYWNoIHN0YXRlJ3MgY29udHJvbGxlciBjYW4gYmUgZm91bmQgaW4gY29udHJvbGxlcnMuanNcblx0JHN0YXRlUHJvdmlkZXJcblxuXHQvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG5cdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RhYnMvdGFicy5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01hcENvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdtYXBWbSdcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbW9yZVZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIE1hcENvbnRyb2xsZXIpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gTWFwQ29udHJvbGxlcigkc2NvcGUsIGdlb1NlcnZpY2UsIGJ1c1N0b3BzU2VydmljZSkge1xuXHQnbmdJbmplY3QnO1xuXG5cdCRzY29wZS5wb3NpdGlvbiA9IHt9O1xuXHQkc2NvcGUuYnVzU3RvcHMgPSB7fTtcblx0JHNjb3BlLmVycm9yID0gJyc7XG5cblx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0JHNjb3BlLmdldFBvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbjtcblx0XHQkc2NvcGUuZ2V0QnVzU3RvcHNOZWFyYnkgPSB0aGlzLmdldEJ1c1N0b3BzTmVhcmJ5O1xuXHRcdCRzY29wZS5idWlsZE1hcCA9IHRoaXMuYnVpbGRNYXA7XG5cblx0XHR0aGlzLmdldFBvc2l0aW9uKCk7XG5cdH07XG5cblx0dGhpcy5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGdlb1NlcnZpY2UuZ2V0Q3VycmVudFBvc2l0aW9uKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdCRzY29wZS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdFx0XHQkc2NvcGUuZ2V0QnVzU3RvcHNOZWFyYnkoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRzY29wZS5lcnJvciA9ICdUaGVyZSBoYXMgYmVlbiBhbiBlcnJvci4nO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5nZXRCdXNTdG9wc05lYXJieSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb29yZHMgPSAkc2NvcGUucG9zaXRpb24uY29vcmRzO1xuXG5cdFx0YnVzU3RvcHNTZXJ2aWNlLmdldExvY2FsKGNvb3Jkcylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdCRzY29wZS5idXNTdG9wcyA9IHJlc3BvbnNlO1xuXHRcdFx0XHQkc2NvcGUuYnVpbGRNYXAoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCRzY29wZS5lcnJvciA9ICdUaGVyZSBoYXMgYmVlbiBhbiBlcnJvci4nO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5idWlsZE1hcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0gJHNjb3BlLmJ1c1N0b3BzLmRhdGE7XG5cdFx0dmFyIG1hcmtlcnMgPSBbXTtcblxuXHRcdHZhciBtYXBPcHRpb25zID0ge1xuXHRcdFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGRhdGEubGF0aXR1ZGUsIGRhdGEubG9uZ2l0dWRlKSxcblx0XHRcdHpvb206IDEwLFxuXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHRcdH07XG5cblx0XHQkc2NvcGUubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0XHRhbmd1bGFyLmZvckVhY2goZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXG5cdFx0XHR2YXIgTGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhzdG9wLmxhdGl0dWRlLCBzdG9wLmxvbmdpdHVkZSk7XG5cblx0XHRcdHZhciBtYXJrZXIgPSB7XG5cdFx0XHRcdGlkOiBzdG9wLmF0Y29jb2RlLFxuXHRcdFx0XHRwb3NpdGlvbjogTGF0TG5nLFxuXHRcdFx0XHR0aXRsZTogc3RvcC5uYW1lXG5cdFx0XHR9O1xuXG5cdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHR9KTtcblxuXHRcdCRzY29wZS5tYXJrZXJzID0gbWFya2Vycztcblx0fTtcblxuXHR0aGlzLmluaXQoKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnKVxuXHQuZGlyZWN0aXZlKCd1aU1hcCcsIHVpTWFwKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIHVpTWFwKCkge1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IGlkPVwiZ21hcHNcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PicsXG5cdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRzY29wZToge1xuXHRcdFx0b3B0aW9uczogJz0nLFxuXHRcdFx0bWFya2VyczogJz0nXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHZhciBtYXA7XG5cdFx0XHR2YXIgaW5mb1dpbmRvdztcblx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cdFx0XHR2YXIgbWFwT3B0aW9ucyA9IHNjb3BlLm9wdGlvbnM7XG5cdFx0XHR2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuXG5cdFx0XHQoZnVuY3Rpb24gaW5pdE1hcCgpIHtcblx0XHRcdFx0aWYgKG1hcCA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0bWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChlbGVtZW50WzBdLCBtYXBPcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoKTtcblxuXHRcdFx0ZnVuY3Rpb24gc2V0TWFya2VycygpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHNjb3BlLm1hcmtlcnMsIGZ1bmN0aW9uKG1hcmtlcikge1xuXG5cdFx0XHRcdFx0dmFyIG1hcmtlck9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdFx0XHR0aXRsZTogbWFya2VyLnRpdGxlLFxuXHRcdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cdFx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR2YXIgaW5mb1dpbmRvd09wdGlvbnM7XG5cblx0XHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0Y29udGVudDogbWFya2VyLnRpdGxlXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0c2NvcGUuJHdhdGNoKGF0dHIubWFya2VycywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjaGFuZ2VkJyk7XG5cdFx0XHRcdHNldE1hcmtlcnMoKTtcblx0XHRcdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXHRcdFx0XHRtYXAucGFuVG9Cb3VuZHMoYm91bmRzKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtb3JlTW9kdWxlJylcblx0LmNvbnRyb2xsZXIoJ01vcmVDb250cm9sbGVyJywgTW9yZUNvbnRyb2xsZXIpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gTW9yZUNvbnRyb2xsZXIoJHNjb3BlKSB7fSIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cdC5mYWN0b3J5KCdnbG9iYWxzRmFjdG9yeScsIGdsb2JhbHNGYWN0b3J5KTtcblxuZnVuY3Rpb24gZ2xvYmFsc0ZhY3RvcnkoKSB7XG5cdHJldHVybiB7XG5cdFx0YXBwX2lkOiAnODc5OTA5NjYnLFxuXHRcdGFwcF9rZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpX3VybF9uZWFyOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdzZXJ2aWNlcycpXG5cdC5zZXJ2aWNlKCdidXNTdG9wc1NlcnZpY2UnLCBidXNTdG9wc1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gYnVzU3RvcHNTZXJ2aWNlKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFsc0ZhY3RvcnkpIHtcblx0dmFyIGdlbmVyYXRlUXVlcnlPYmogPSBmdW5jdGlvbihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzRmFjdG9yeS5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzRmFjdG9yeS5hcHBfaWRcblx0XHR9O1xuXHR9O1xuXG5cdHRoaXMuZ2V0TG9jYWwgPSBmdW5jdGlvbiAoY29vcmRzKSB7XG5cdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHR1cmw6IGdsb2JhbHNGYWN0b3J5LmFwaV91cmxfbmVhciArICc/JyArICRodHRwUGFyYW1TZXJpYWxpemVyKGdlbmVyYXRlUXVlcnlPYmooY29vcmRzKSlcblx0XHR9KTtcblx0fTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ3NlcnZpY2VzJylcblx0LnNlcnZpY2UoJ2dlb1NlcnZpY2UnLCBnZW9TZXJ2aWNlKTtcblxuLyogbmdJbmplY3QgKi9cbmZ1bmN0aW9uIGdlb1NlcnZpY2UoJHEsICR3aW5kb3csICRyb290U2NvcGUpIHtcblx0dGhpcy5nZXRDdXJyZW50UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0XHR9KTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0JHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHR9O1xufSJdfQ==
