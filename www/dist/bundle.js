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
			.catch(function(error) {
				mapVm.error = error;
			});
	};

	this.getBusStopsNearby = function() {
		var coords = mapVm.position.coords;

		busStopsService.getLocal(coords)
			.then(function(response) {
				mapVm.busStops = response;
				mapVm.buildMap();
			})
			.catch(function(error) {
				mapVm.error = error;
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

		data.then(function(data) {
			busStopData = data;
		});

		return data;
	}

	return {
		getLocal: getLocal
	};

}

},{}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvZ2VvU2VydmljZS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1hcE1vZHVsZScsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubW9yZU1vZHVsZScsIFtdKTtcblxucmVxdWlyZSgnLi4vY29tbW9uL3NlcnZpY2VzL2dsb2JhbHNGYWN0b3J5Jyk7XG5yZXF1aXJlKCcuLi9jb21tb24vc2VydmljZXMvZ2VvU2VydmljZScpO1xucmVxdWlyZSgnLi4vY29tbW9uL3NlcnZpY2VzL2J1c1N0b3BzU2VydmljZScpO1xucmVxdWlyZSgnLi9tYXAvbWFwQ29udHJvbGxlcicpO1xucmVxdWlyZSgnLi9tYXAvbWFwRGlyZWN0aXZlJyk7XG5yZXF1aXJlKCcuL21vcmUvbW9yZUNvbnRyb2xsZXInKTtcblxuYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcCcsIFtcblx0J2lvbmljJyxcblx0J2J1c3RsZUFwcC5zZXJ2aWNlcycsXG5cdCdidXN0bGVBcHAubWFwTW9kdWxlJyxcblx0J2J1c3RsZUFwcC5tb3JlTW9kdWxlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuXHQkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cblx0XHR9XG5cdFx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHRcdC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcblx0XHRcdFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcblx0XHR9XG5cdH0pO1xufSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cblx0Ly8gSW9uaWMgdXNlcyBBbmd1bGFyVUkgUm91dGVyIHdoaWNoIHVzZXMgdGhlIGNvbmNlcHQgb2Ygc3RhdGVzXG5cdC8vIExlYXJuIG1vcmUgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyXG5cdC8vIFNldCB1cCB0aGUgdmFyaW91cyBzdGF0ZXMgd2hpY2ggdGhlIGFwcCBjYW4gYmUgaW4uXG5cdC8vIEVhY2ggc3RhdGUncyBjb250cm9sbGVyIGNhbiBiZSBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xuXHQkc3RhdGVQcm92aWRlclxuXG5cdC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcblx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGFicy90YWJzLmh0bWwnXG5cdH0pXG5cblx0Ly8gRWFjaCB0YWIgaGFzIGl0cyBvd24gbmF2IGhpc3Rvcnkgc3RhY2s6XG5cblx0LnN0YXRlKCd0YWIubWFwJywge1xuXHRcdHVybDogJy9tYXAnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1hcCc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbWFwL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTWFwQ29udHJvbGxlcicsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ21hcFZtJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdtb3JlVm0nXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2J1c3RsZUFwcC5tYXBNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIE1hcENvbnRyb2xsZXIpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gTWFwQ29udHJvbGxlcihnZW9TZXJ2aWNlLCBidXNTdG9wc1NlcnZpY2UpIHtcblx0dmFyIG1hcFZtID0gdGhpcztcblxuXHR0aGlzLnBvc2l0aW9uID0ge307XG5cdHRoaXMuYnVzU3RvcHMgPSB7fTtcblx0dGhpcy5lcnJvciA9ICcnO1xuXG5cdHRoaXMuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdG1hcFZtLmdldFBvc2l0aW9uKCk7XG5cdH07XG5cblx0dGhpcy5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuXHRcdGdlb1NlcnZpY2UuZ2V0Q3VycmVudFBvc2l0aW9uKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdG1hcFZtLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0XHRcdG1hcFZtLmdldEJ1c1N0b3BzTmVhcmJ5KCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdG1hcFZtLmVycm9yID0gZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR0aGlzLmdldEJ1c1N0b3BzTmVhcmJ5ID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvb3JkcyA9IG1hcFZtLnBvc2l0aW9uLmNvb3JkcztcblxuXHRcdGJ1c1N0b3BzU2VydmljZS5nZXRMb2NhbChjb29yZHMpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRtYXBWbS5idXNTdG9wcyA9IHJlc3BvbnNlO1xuXHRcdFx0XHRtYXBWbS5idWlsZE1hcCgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRtYXBWbS5lcnJvciA9IGVycm9yO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dGhpcy5idWlsZE1hcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBkYXRhID0gbWFwVm0uYnVzU3RvcHMuZGF0YTtcblx0XHR2YXIgbWFya2VycyA9IFtdO1xuXG5cdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoZGF0YS5sYXRpdHVkZSwgZGF0YS5sb25naXR1ZGUpLFxuXHRcdFx0em9vbTogMTAsXG5cdFx0XHRtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdFx0fTtcblxuXHRcdG1hcFZtLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdFx0YW5ndWxhci5mb3JFYWNoKGRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblxuXHRcdFx0dmFyIExhdExuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHR2YXIgbWFya2VyID0ge1xuXHRcdFx0XHRpZDogc3RvcC5hdGNvY29kZSxcblx0XHRcdFx0cG9zaXRpb246IExhdExuZyxcblx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHRcdFx0fTtcblxuXHRcdFx0bWFya2Vycy5wdXNoKG1hcmtlcik7XG5cdFx0fSk7XG5cblx0XHRtYXBWbS5tYXJrZXJzID0gbWFya2Vycztcblx0fTtcblxuXHR0aGlzLmluaXQoKTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAubWFwTW9kdWxlJylcblx0LmRpcmVjdGl2ZSgndWlNYXAnLCB1aU1hcCk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiB1aU1hcCgpIHtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcnMoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IG1hcmtlci5wb3NpdGlvbixcblx0XHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlci50aXRsZSxcblx0XHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuXHRcdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2VyLnBvc2l0aW9uKTtcblxuXHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zO1xuXG5cdFx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLiR3YXRjaChhdHRyLm1hcmtlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2hhbmdlZCcpO1xuXHRcdFx0XHRzZXRNYXJrZXJzKCk7XG5cdFx0XHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblx0XHRcdFx0bWFwLnBhblRvQm91bmRzKGJvdW5kcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLm1vcmVNb2R1bGUnKVxuXHQuY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBNb3JlQ29udHJvbGxlcik7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBNb3JlQ29udHJvbGxlcigkc2NvcGUpIHt9IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmZhY3RvcnkoJ2J1c1N0b3BzU2VydmljZScsIGJ1c1N0b3BzU2VydmljZSk7XG5cbi8qIG5nSW5qZWN0ICovXG5mdW5jdGlvbiBidXNTdG9wc1NlcnZpY2UoJGh0dHAsICRodHRwUGFyYW1TZXJpYWxpemVyLCBnbG9iYWxzRmFjdG9yeSkge1xuXG5cdHZhciBidXNTdG9wRGF0YSA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzRmFjdG9yeS5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzRmFjdG9yeS5hcHBfaWRcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0TG9jYWwoY29vcmRzKSB7XG5cdFx0dmFyIGRhdGEgPSAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0dXJsOiBnbG9iYWxzRmFjdG9yeS5hcGlfdXJsX25lYXIgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0fSk7XG5cblx0XHRkYXRhLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0YnVzU3RvcERhdGEgPSBkYXRhO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGdldExvY2FsOiBnZXRMb2NhbFxuXHR9O1xuXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdidXN0bGVBcHAuc2VydmljZXMnKVxuXHQuZmFjdG9yeSgnZ2VvU2VydmljZScsIGdlb1NlcnZpY2UpO1xuXG4vKiBuZ0luamVjdCAqL1xuZnVuY3Rpb24gZ2VvU2VydmljZSgkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXG5cdHZhciBwb3NpdGlvbiA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ2V0Q3VycmVudFBvc2l0aW9uKCkge1xuXHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShkYXRhKTtcblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHR9KTtcblxuXHRcdGRlZmVycmVkLnByb21pc2UudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRwb3NpdGlvbiA9IGRhdGE7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZ2V0Q3VycmVudFBvc2l0aW9uXG5cdH07XG59IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwLnNlcnZpY2VzJylcblx0LmZhY3RvcnkoJ2dsb2JhbHNGYWN0b3J5JywgZ2xvYmFsc0ZhY3RvcnkpO1xuXG5mdW5jdGlvbiBnbG9iYWxzRmFjdG9yeSgpIHtcblx0cmV0dXJuIHtcblx0XHRhcHBfaWQ6ICc4Nzk5MDk2NicsXG5cdFx0YXBwX2tleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlfdXJsX25lYXI6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSJdfQ==
