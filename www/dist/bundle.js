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

	$scope.refresh = function() {
		console.log('refresh');
	};

	// Get position
	function getPosition() {
		geo.getCurrentPosition().then(function(position) {
			console.log(position);
			$scope.position = position;
		}, function(error) {
			alert(error);
		});
	}

	// Get local stops

	// Generate markers

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwid3d3L2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInd3dy9hcHAvbW9yZS9jb250cm9sbGVycy5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2J1c1N0b3BzLmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2VvLmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnZ2xvYmFscycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdnZW8nLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzU3RvcHMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbWFwQXBwJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21vcmVBcHAnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFscycpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9nZW8nKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvYnVzU3RvcHMnKTtcbnJlcXVpcmUoJy4vbWFwL2NvbnRyb2xsZXJzJyk7XG5yZXF1aXJlKCcuL21hcC9kaXJlY3RpdmVzJyk7XG5yZXF1aXJlKCcuL21vcmUvY29udHJvbGxlcnMnKTtcblxuYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFtcblx0J2lvbmljJyxcblx0J2dsb2JhbHMnLFxuXHQnZ2VvJyxcblx0J2J1c1N0b3BzJyxcblx0J21hcEFwcCcsXG5cdCdtb3JlQXBwJ1xuXSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuXHQkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cblx0XHR9XG5cdFx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHRcdC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcblx0XHRcdFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcblx0XHR9XG5cdH0pO1xufSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cblx0Ly8gSW9uaWMgdXNlcyBBbmd1bGFyVUkgUm91dGVyIHdoaWNoIHVzZXMgdGhlIGNvbmNlcHQgb2Ygc3RhdGVzXG5cdC8vIExlYXJuIG1vcmUgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyXG5cdC8vIFNldCB1cCB0aGUgdmFyaW91cyBzdGF0ZXMgd2hpY2ggdGhlIGFwcCBjYW4gYmUgaW4uXG5cdC8vIEVhY2ggc3RhdGUncyBjb250cm9sbGVyIGNhbiBiZSBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xuXHQkc3RhdGVQcm92aWRlclxuXG5cdC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcblx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGFicy90YWJzLmh0bWwnXG5cdH0pXG5cblx0Ly8gRWFjaCB0YWIgaGFzIGl0cyBvd24gbmF2IGhpc3Rvcnkgc3RhY2s6XG5cblx0LnN0YXRlKCd0YWIubWFwJywge1xuXHRcdHVybDogJy9tYXAnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1hcCc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbWFwL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTWFwQ29udHJvbGxlcidcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBBcHAnKVxuXG4uY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFscywgZ2VvLCBidXNTdG9wcykge1xuXG5cdCRzY29wZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3JlZnJlc2gnKTtcblx0fTtcblxuXHQvLyBHZXQgcG9zaXRpb25cblx0ZnVuY3Rpb24gZ2V0UG9zaXRpb24oKSB7XG5cdFx0Z2VvLmdldEN1cnJlbnRQb3NpdGlvbigpLnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKHBvc2l0aW9uKTtcblx0XHRcdCRzY29wZS5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRhbGVydChlcnJvcik7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBHZXQgbG9jYWwgc3RvcHNcblxuXHQvLyBHZW5lcmF0ZSBtYXJrZXJzXG5cblx0Z2VvLmdldEN1cnJlbnRQb3NpdGlvbigpLnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHR2YXIgY29vcmRzID0gcG9zaXRpb24uY29vcmRzO1xuXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlKSxcblx0XHRcdHpvb206IDE0LFxuXHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHRcdH07XG5cblx0XHQkc2NvcGUubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0XHRidXNTdG9wcy5nZXRMb2NhbChjb29yZHMpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzJywgcmVzcG9uc2UpO1xuXG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UuZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHRcdHZhciBtYXJrZXIgPSB7XG5cdFx0XHRcdFx0aWQ6IHN0b3AuYXRjb2NvZGUsXG5cdFx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdFx0XHRcdHRpdGxlOiBzdG9wLm5hbWVcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQkc2NvcGUubWFya2VycyA9IG1hcmtlcnM7XG5cblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yOiAnLCBlcnJvcik7XG5cdFx0fSk7XG5cblx0fSk7XG5cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcEFwcCcpXG5cbi5kaXJlY3RpdmUoJ3VpTWFwJywgZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHR2YXIgbWFya2VyT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdHRpdGxlOiBtYXJrZXIudGl0bGUsXG5cdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcblx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBpbmZvV2luZG93T3B0aW9ucztcblxuXHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpbmZvV2luZG93T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHR9KTtcblxuXHRcdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21vcmVBcHAnKVxuXG4uY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXNTdG9wcycpXG5cbi5mYWN0b3J5KCdidXNTdG9wcycsIFsnJGh0dHAnLCAnJGh0dHBQYXJhbVNlcmlhbGl6ZXInLCAnZ2xvYmFscycsIGZ1bmN0aW9uKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFscykge1xuXG5cdHZhciBnZW5lcmF0ZVF1ZXJ5T2JqID0gZnVuY3Rpb24oY29vcmRzKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGxhdDogY29vcmRzLmxhdGl0dWRlLFxuXHRcdFx0bG9uOiBjb29yZHMubG9uZ2l0dWRlLFxuXHRcdFx0YXBwX2tleTogZ2xvYmFscy5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzLmFwcF9pZFxuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRnZXRMb2NhbDogZnVuY3Rpb24gKGNvb3Jkcykge1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0dXJsOiBnbG9iYWxzLmFwaV91cmxfbmVhciArICc/JyArICRodHRwUGFyYW1TZXJpYWxpemVyKGdlbmVyYXRlUXVlcnlPYmooY29vcmRzKSlcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1dKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdnZW8nKVxuXG4uZmFjdG9yeSgnZ2VvJywgWyckcScsICckd2luZG93JywgZnVuY3Rpb24oJHEsICR3aW5kb3cpIHtcblx0cmV0dXJuIHtcblx0XHRnZXRDdXJyZW50UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xuXHRcdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0XHR9XG5cdH07XG59XSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZ2xvYmFscycpXG5cbi5mYWN0b3J5KCdnbG9iYWxzJywgZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YXBwX2lkOiAnODc5OTA5NjYnLFxuXHRcdGFwcF9rZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpX3VybF9uZWFyOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0pOyJdfQ==
