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

.controller('MapController', function($scope, geoFactory) {
	'ngInject';

	$scope.getPosition = function() {
		geoFactory.getCurrentPosition()
			.then(function(position) {
				$scope.position = position;
			})
			.catch(function() {
				$scope.error = 'There has been an error.';
			});
	};

	$scope.getPosition();


	// $scope.refresh = function() {
	// 	geoFactory.getCurrentPosition().then(function(position) {
	// 		var coords = position.coords;

	// 		var mapOptions = {
	// 			center: new google.maps.LatLng(coords.latitude, coords.longitude),
	// 			zoom: 10,
	// 			mapTypeId: google.maps.MapTypeId.ROADMAP,
	// 			scrollwheel: false
	// 		};

	// 		$scope.mapOptions = mapOptions;

	// 		busstopsFactory.getLocal(coords).then(function(response) {
	// 			console.log('Success', response);

	// 			var markers = [];

	// 			angular.forEach(response.data.stops, function(stop) {

	// 				var position = new google.maps.LatLng(stop.latitude, stop.longitude);

	// 				var marker = {
	// 					id: stop.atcocode,
	// 					position: position,
	// 					title: stop.name
	// 				};

	// 				markers.push(marker);
	// 			});

	// 			$scope.markers = markers;

	// 		}, function(error) {
	// 			console.log('Error: ', error);
	// 		});
	// 	});
	// };

	// $scope.refresh();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnkuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nZW9GYWN0b3J5LmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdzZXJ2aWNlcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbWFwTW9kdWxlJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21vcmVNb2R1bGUnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2VvRmFjdG9yeScpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4vbWFwL21hcENvbnRyb2xsZXInKTtcbnJlcXVpcmUoJy4vbWFwL21hcERpcmVjdGl2ZScpO1xucmVxdWlyZSgnLi9tb3JlL21vcmVDb250cm9sbGVyJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAnLCBbXG5cdCdpb25pYycsXG5cdCdzZXJ2aWNlcycsXG5cdCdmYWN0b3JpZXMnLFxuXHQnbWFwTW9kdWxlJyxcblx0J21vcmVNb2R1bGUnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScpXG5cbi5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBnZW9GYWN0b3J5KSB7XG5cdCduZ0luamVjdCc7XG5cblx0JHNjb3BlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cdFx0Z2VvRmFjdG9yeS5nZXRDdXJyZW50UG9zaXRpb24oKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0JHNjb3BlLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkc2NvcGUuZXJyb3IgPSAnVGhlcmUgaGFzIGJlZW4gYW4gZXJyb3IuJztcblx0XHRcdH0pO1xuXHR9O1xuXG5cdCRzY29wZS5nZXRQb3NpdGlvbigpO1xuXG5cblx0Ly8gJHNjb3BlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcblx0Ly8gXHRnZW9GYWN0b3J5LmdldEN1cnJlbnRQb3NpdGlvbigpLnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0Ly8gXHRcdHZhciBjb29yZHMgPSBwb3NpdGlvbi5jb29yZHM7XG5cblx0Ly8gXHRcdHZhciBtYXBPcHRpb25zID0ge1xuXHQvLyBcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlKSxcblx0Ly8gXHRcdFx0em9vbTogMTAsXG5cdC8vIFx0XHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXG5cdC8vIFx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHQvLyBcdFx0fTtcblxuXHQvLyBcdFx0JHNjb3BlLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdC8vIFx0XHRidXNzdG9wc0ZhY3RvcnkuZ2V0TG9jYWwoY29vcmRzKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdC8vIFx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzJywgcmVzcG9uc2UpO1xuXG5cdC8vIFx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cblx0Ly8gXHRcdFx0YW5ndWxhci5mb3JFYWNoKHJlc3BvbnNlLmRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblxuXHQvLyBcdFx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdC8vIFx0XHRcdFx0dmFyIG1hcmtlciA9IHtcblx0Ly8gXHRcdFx0XHRcdGlkOiBzdG9wLmF0Y29jb2RlLFxuXHQvLyBcdFx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHQvLyBcdFx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHQvLyBcdFx0XHRcdH07XG5cblx0Ly8gXHRcdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0Ly8gXHRcdFx0fSk7XG5cblx0Ly8gXHRcdFx0JHNjb3BlLm1hcmtlcnMgPSBtYXJrZXJzO1xuXG5cdC8vIFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHQvLyBcdFx0XHRjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycm9yKTtcblx0Ly8gXHRcdH0pO1xuXHQvLyBcdH0pO1xuXHQvLyB9O1xuXG5cdC8vICRzY29wZS5yZWZyZXNoKCk7XG5cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScpXG5cbi5kaXJlY3RpdmUoJ3VpTWFwJywgZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcnMoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IG1hcmtlci5wb3NpdGlvbixcblx0XHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlci50aXRsZSxcblx0XHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuXHRcdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2VyLnBvc2l0aW9uKTtcblxuXHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zO1xuXG5cdFx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLiR3YXRjaChhdHRyLm1hcmtlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2hhbmdlZCcpO1xuXHRcdFx0XHRzZXRNYXJrZXJzKCk7XG5cdFx0XHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblx0XHRcdFx0bWFwLnBhblRvQm91bmRzKGJvdW5kcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtb3JlTW9kdWxlJylcblxuLmNvbnRyb2xsZXIoJ01vcmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7fSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2J1c3N0b3BzRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFsc0ZhY3RvcnkpIHtcblx0J25nSW5qZWN0JztcblxuXHR2YXIgZ2VuZXJhdGVRdWVyeU9iaiA9IGZ1bmN0aW9uKGNvb3Jkcykge1xuXHRcdHJldHVybiB7XG5cdFx0XHRsYXQ6IGNvb3Jkcy5sYXRpdHVkZSxcblx0XHRcdGxvbjogY29vcmRzLmxvbmdpdHVkZSxcblx0XHRcdGFwcF9rZXk6IGdsb2JhbHNGYWN0b3J5LmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHNGYWN0b3J5LmFwcF9pZFxuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRnZXRMb2NhbDogZnVuY3Rpb24gKGNvb3Jkcykge1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0dXJsOiBnbG9iYWxzRmFjdG9yeS5hcGlfdXJsX25lYXIgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnKVxuXG4uZmFjdG9yeSgnZ2VvRmFjdG9yeScsIGZ1bmN0aW9uKCRxLCAkd2luZG93LCAkcm9vdFNjb3BlKSB7XG5cdCduZ0luamVjdCc7XG5cblx0cmV0dXJuIHtcblx0XHRnZXRDdXJyZW50UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cbi5mYWN0b3J5KCdnbG9iYWxzRmFjdG9yeScsIGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFwcF9pZDogJzg3OTkwOTY2Jyxcblx0XHRhcHBfa2V5OiAnMzNhNWNmOWU1NGZhNzI3NTM3ZTQ5NDFjYjA0ZDgxYzQnLFxuXHRcdGFwaV91cmxfbmVhcjogJ2h0dHA6Ly90cmFuc3BvcnRhcGkuY29tL3YzL3VrL2J1cy9zdG9wcy9uZWFyLmpzb24nXG5cdH07XG59KTsiXX0=
