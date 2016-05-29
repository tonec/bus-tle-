(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('services', []);
angular.module('factories', []);
angular.module('mapModule', []);
angular.module('moreModule', []);

require('../common/factories/globalsFactory');
require('../common/factories/geoFactory');
require('../common/factories/busstopsFactory');
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
				controller: 'MapController'
			}
		}
	})

	.state('tab.more', {
		url: '/more',
		views: {
			'tab-more': {
				templateUrl: 'app/more/views/index.html',
				controller: 'MoreController'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/map');

});

},{"../common/factories/busstopsFactory":5,"../common/factories/geoFactory":6,"../common/factories/globalsFactory":7,"./map/mapController":2,"./map/mapDirective":3,"./more/moreController":4}],2:[function(require,module,exports){
module.exports = angular.module('mapModule')

.controller('MapController', function($scope, geoFactory, busstopsFactory) {
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
		geoFactory.getCurrentPosition()
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

		busstopsFactory.getLocal(coords)
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
});
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapModule')

.directive('uiMap', function() {

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
});
},{}],4:[function(require,module,exports){
module.exports = angular.module('moreModule')

.controller('MoreController', function($scope) {});
},{}],5:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('busstopsFactory', function($http, $httpParamSerializer, globalsFactory) {
	'ngInject';

	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globalsFactory.app_key,
			app_id: globalsFactory.app_id
		};
	};

	return {
		getLocal: function (coords) {
			return $http({
				method: 'GET',
				url: globalsFactory.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
			});
		}
	};
});
},{}],6:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('geoFactory', function($q, $window, $rootScope) {
	'ngInject';

	return {
		getCurrentPosition: function() {
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
		}
	};
});
},{}],7:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('globalsFactory', function() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnkuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nZW9GYWN0b3J5LmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdzZXJ2aWNlcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbWFwTW9kdWxlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21vcmVNb2R1bGUnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2VvRmFjdG9yeScpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4vbWFwL21hcENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vbWFwL21hcERpcmVjdGl2ZScpO1xucmVxdWlyZSgnLi9tb3JlL21vcmVDb250cm9sbGVyJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAnLCBbXG5cdCdpb25pYycsXG5cdCdzZXJ2aWNlcycsXG5cdCdmYWN0b3JpZXMnLFxuXHQnbWFwTW9kdWxlJyxcblx0J21vcmVNb2R1bGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBnZW9GYWN0b3J5LCBidXNzdG9wc0ZhY3RvcnkpIHtcblx0J25nSW5qZWN0JztcblxuXHQkc2NvcGUucG9zaXRpb24gPSB7fTtcblx0JHNjb3BlLmJ1c1N0b3BzID0ge307XG5cdCRzY29wZS5lcnJvciA9ICcnO1xuXG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdCRzY29wZS5nZXRQb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb247XG5cdFx0JHNjb3BlLmdldEJ1c1N0b3BzTmVhcmJ5ID0gdGhpcy5nZXRCdXNTdG9wc05lYXJieTtcblx0XHQkc2NvcGUuYnVpbGRNYXAgPSB0aGlzLmJ1aWxkTWFwO1xuXG5cdFx0dGhpcy5nZXRQb3NpdGlvbigpO1xuXHR9O1xuXG5cdHRoaXMuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcblx0XHRnZW9GYWN0b3J5LmdldEN1cnJlbnRQb3NpdGlvbigpXG5cdFx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHQkc2NvcGUucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHRcdFx0JHNjb3BlLmdldEJ1c1N0b3BzTmVhcmJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuZXJyb3IgPSAnVGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IuJztcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuZ2V0QnVzU3RvcHNOZWFyYnkgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29vcmRzID0gJHNjb3BlLnBvc2l0aW9uLmNvb3JkcztcblxuXHRcdGJ1c3N0b3BzRmFjdG9yeS5nZXRMb2NhbChjb29yZHMpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHQkc2NvcGUuYnVzU3RvcHMgPSByZXNwb25zZTtcblx0XHRcdFx0JHNjb3BlLmJ1aWxkTWFwKCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuZXJyb3IgPSAnVGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IuJztcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHRoaXMuYnVpbGRNYXAgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGF0YSA9ICRzY29wZS5idXNTdG9wcy5kYXRhO1xuXHRcdHZhciBtYXJrZXJzID0gW107XG5cblx0XHR2YXIgbWFwT3B0aW9ucyA9IHtcblx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhkYXRhLmxhdGl0dWRlLCBkYXRhLmxvbmdpdHVkZSksXG5cdFx0XHR6b29tOiAxMCxcblx0XHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXG5cdFx0XHRzY3JvbGx3aGVlbDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0JHNjb3BlLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblxuXHRcdFx0dmFyIExhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHR2YXIgbWFya2VyID0ge1xuXHRcdFx0XHRpZDogc3RvcC5hdGNvY29kZSxcblx0XHRcdFx0cG9zaXRpb246IExhdExuZyxcblx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHRcdFx0fTtcblxuXHRcdFx0bWFya2Vycy5wdXNoKG1hcmtlcik7XG5cdFx0fSk7XG5cblx0XHQkc2NvcGUubWFya2VycyA9IG1hcmtlcnM7XG5cdH07XG5cblx0dGhpcy5pbml0KCk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnKVxuXG4uZGlyZWN0aXZlKCd1aU1hcCcsIGZ1bmN0aW9uKCkge1xuXG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdFJyxcblx0XHR0ZW1wbGF0ZTogJzxkaXYgaWQ9XCJnbWFwc1wiIGNsYXNzPVwibWFwXCI+PC9kaXY+Jyxcblx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdHNjb3BlOiB7XG5cdFx0XHRvcHRpb25zOiAnPScsXG5cdFx0XHRtYXJrZXJzOiAnPSdcblx0XHR9LFxuXHRcdGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cikge1xuXHRcdFx0dmFyIG1hcDtcblx0XHRcdHZhciBpbmZvV2luZG93O1xuXHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcblx0XHRcdHZhciBtYXBPcHRpb25zID0gc2NvcGUub3B0aW9ucztcblx0XHRcdHZhciBib3VuZHMgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nQm91bmRzKCk7XG5cblx0XHRcdChmdW5jdGlvbiBpbml0TWFwKCkge1xuXHRcdFx0XHRpZiAobWFwID09PSB2b2lkIDApIHtcblx0XHRcdFx0XHRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGVsZW1lbnRbMF0sIG1hcE9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSgpO1xuXG5cdFx0XHRmdW5jdGlvbiBzZXRNYXJrZXJzKCkge1xuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2goc2NvcGUubWFya2VycywgZnVuY3Rpb24obWFya2VyKSB7XG5cblx0XHRcdFx0XHR2YXIgbWFya2VyT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdHBvc2l0aW9uOiBtYXJrZXIucG9zaXRpb24sXG5cdFx0XHRcdFx0XHRtYXA6IG1hcCxcblx0XHRcdFx0XHRcdHRpdGxlOiBtYXJrZXIudGl0bGUsXG5cdFx0XHRcdFx0XHRpY29uOiAnaHR0cHM6Ly9tYXBzLmdvb2dsZS5jb20vbWFwZmlsZXMvbXMvaWNvbnMvZ3JlZW4tZG90LnBuZydcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcblx0XHRcdFx0XHRib3VuZHMuZXh0ZW5kKG1hcmtlci5wb3NpdGlvbik7XG5cblx0XHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHZhciBpbmZvV2luZG93T3B0aW9ucztcblxuXHRcdFx0XHRcdFx0aWYgKGluZm9XaW5kb3cgIT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdFx0XHRpbmZvV2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3dPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0XHRjb250ZW50OiBtYXJrZXIudGl0bGVcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGluZm9XaW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyhpbmZvV2luZG93T3B0aW9ucyk7XG5cdFx0XHRcdFx0XHRpbmZvV2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRzY29wZS4kd2F0Y2goYXR0ci5tYXJrZXJzLCBmdW5jdGlvbigpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ2NoYW5nZWQnKTtcblx0XHRcdFx0c2V0TWFya2VycygpO1xuXHRcdFx0XHRtYXAuZml0Qm91bmRzKGJvdW5kcyk7XG5cdFx0XHRcdG1hcC5wYW5Ub0JvdW5kcyhib3VuZHMpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbW9yZU1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdNb3JlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge30pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cbi5mYWN0b3J5KCdidXNzdG9wc0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJGh0dHBQYXJhbVNlcmlhbGl6ZXIsIGdsb2JhbHNGYWN0b3J5KSB7XG5cdCduZ0luamVjdCc7XG5cblx0dmFyIGdlbmVyYXRlUXVlcnlPYmogPSBmdW5jdGlvbihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzRmFjdG9yeS5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzRmFjdG9yeS5hcHBfaWRcblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0Z2V0TG9jYWw6IGZ1bmN0aW9uIChjb29yZHMpIHtcblx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdHVybDogZ2xvYmFsc0ZhY3RvcnkuYXBpX3VybF9uZWFyICsgJz8nICsgJGh0dHBQYXJhbVNlcmlhbGl6ZXIoZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2dlb0ZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXHQnbmdJbmplY3QnO1xuXG5cdHJldHVybiB7XG5cdFx0Z2V0Q3VycmVudFBvc2l0aW9uOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHRcdCR3aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHBvc2l0aW9uKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHQkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0XHR9XG5cdH07XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnKVxuXG4uZmFjdG9yeSgnZ2xvYmFsc0ZhY3RvcnknLCBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRhcHBfaWQ6ICc4Nzk5MDk2NicsXG5cdFx0YXBwX2tleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlfdXJsX25lYXI6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSk7Il19
