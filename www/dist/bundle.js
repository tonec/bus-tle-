(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('globals', []);
angular.module('geo', []);
angular.module('busStops', []);
angular.module('mapApp', []);
angular.module('moreApp', []);

require('../common/factories/globals');
require('../common/factories/geo');
require('../common/factories/busStops');
require('./map/controllers');
require('./map/directives');
require('./more/controllers');

angular.module('app', [
	'ionic',
	'globals',
	'geo',
	'busStops',
	'mapApp',
	'moreApp'
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

},{"../common/factories/busStops":5,"../common/factories/geo":6,"../common/factories/globals":7,"./map/controllers":2,"./map/directives":3,"./more/controllers":4}],2:[function(require,module,exports){
module.exports = angular.module('mapApp')

.controller('MapController', function($scope, globals, geo, busStops) {

	geo.getCurrentPosition().then(function(position) {
		var coords = position.coords;

		var mapOptions = {
			center: new google.maps.LatLng(coords.latitude, coords.longitude),
			zoom: 14,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

		busStops.getLocal(coords).then(function(response) {
			console.log('Success', response);

			var markers = [];

			angular.forEach(response.data.stops, function(stop) {

				var position = new google.maps.LatLng(stop.latitude, stop.longitude);

				var marker = {
					id: stop.atcocode,
					position: position,
					title: stop.name
				};

				markers.push(marker);
			});

			$scope.markers = markers;

		}, function(error) {
			console.log('Error: ', error);
		});

	});

});
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapApp')

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

			map.fitBounds(bounds);
		}
	};

});
},{}],4:[function(require,module,exports){
module.exports = angular.module('moreApp')

.controller('MoreController', function($scope) {});
},{}],5:[function(require,module,exports){
module.exports = angular.module('busStops')

.factory('busStops', ['$http', '$httpParamSerializer', 'globals', function($http, $httpParamSerializer, globals) {

	var generateQueryObj = function(coords) {
		return {
			lat: coords.latitude,
			lon: coords.longitude,
			app_key: globals.app_key,
			app_id: globals.app_id
		};
	};

	return {
		getLocal: function (coords) {
			return $http({
				method: 'GET',
				url: globals.api_url_near + '?' + $httpParamSerializer(generateQueryObj(coords))
			});
		}
	};
}]);
},{}],6:[function(require,module,exports){
module.exports = angular.module('geo')

.factory('geo', ['$q', '$window', function($q, $window) {
	return {
		getCurrentPosition: function() {
			var deferred = $q.defer();

			$window.navigator.geolocation.getCurrentPosition(function(position) {
				deferred.resolve(position);
			}, function(error) {
				deferred.reject(error);
			});

			return deferred.promise;
		}
	};
}]);
},{}],7:[function(require,module,exports){
module.exports = angular.module('globals')

.factory('globals', function() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwid3d3L2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInd3dy9hcHAvbW9yZS9jb250cm9sbGVycy5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2J1c1N0b3BzLmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2VvLmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdnbG9iYWxzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2dlbycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdidXNTdG9wcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdtYXBBcHAnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbW9yZUFwcCcsIFtdKTtcblxucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9nbG9iYWxzJyk7XG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2dlbycpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9idXNTdG9wcycpO1xucmVxdWlyZSgnLi9tYXAvY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vbWFwL2RpcmVjdGl2ZXMnKTtcbnJlcXVpcmUoJy4vbW9yZS9jb250cm9sbGVycycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnZ2xvYmFscycsXG5cdCdnZW8nLFxuXHQnYnVzU3RvcHMnLFxuXHQnbWFwQXBwJyxcblx0J21vcmVBcHAnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcEFwcCcpXG5cbi5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxzLCBnZW8sIGJ1c1N0b3BzKSB7XG5cblx0Z2VvLmdldEN1cnJlbnRQb3NpdGlvbigpLnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHR2YXIgY29vcmRzID0gcG9zaXRpb24uY29vcmRzO1xuXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlKSxcblx0XHRcdHpvb206IDE0LFxuXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHRcdH07XG5cblx0XHQkc2NvcGUubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0XHRidXNTdG9wcy5nZXRMb2NhbChjb29yZHMpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzJywgcmVzcG9uc2UpO1xuXG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UuZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHRcdHZhciBtYXJrZXIgPSB7XG5cdFx0XHRcdFx0aWQ6IHN0b3AuYXRjb2NvZGUsXG5cdFx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdFx0XHRcdHRpdGxlOiBzdG9wLm5hbWVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkc2NvcGUubWFya2VycyA9IG1hcmtlcnM7XG5cblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yOiAnLCBlcnJvcik7XG5cdFx0fSk7XG5cblx0fSk7XG5cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcEFwcCcpXG5cbi5kaXJlY3RpdmUoJ3VpTWFwJywgZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHR2YXIgbWFya2VyT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdHRpdGxlOiBtYXJrZXIudGl0bGUsXG5cdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcblx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBpbmZvV2luZG93T3B0aW9ucztcblxuXHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpbmZvV2luZG93T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblxuXHRcdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXHRcdH1cblx0fTtcblxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbW9yZUFwcCcpXG5cbi5jb250cm9sbGVyKCdNb3JlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge30pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c1N0b3BzJylcblxuLmZhY3RvcnkoJ2J1c1N0b3BzJywgWyckaHR0cCcsICckaHR0cFBhcmFtU2VyaWFsaXplcicsICdnbG9iYWxzJywgZnVuY3Rpb24oJGh0dHAsICRodHRwUGFyYW1TZXJpYWxpemVyLCBnbG9iYWxzKSB7XG5cblx0dmFyIGdlbmVyYXRlUXVlcnlPYmogPSBmdW5jdGlvbihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzLmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHMuYXBwX2lkXG5cdFx0fTtcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGdldExvY2FsOiBmdW5jdGlvbiAoY29vcmRzKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHR1cmw6IGdsb2JhbHMuYXBpX3VybF9uZWFyICsgJz8nICsgJGh0dHBQYXJhbVNlcmlhbGl6ZXIoZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufV0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2dlbycpXG5cbi5mYWN0b3J5KCdnZW8nLCBbJyRxJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkcSwgJHdpbmRvdykge1xuXHRyZXR1cm4ge1xuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdH1cblx0fTtcbn1dKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdnbG9iYWxzJylcblxuLmZhY3RvcnkoJ2dsb2JhbHMnLCBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRhcHBfaWQ6ICc4Nzk5MDk2NicsXG5cdFx0YXBwX2tleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlfdXJsX25lYXI6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSk7Il19
