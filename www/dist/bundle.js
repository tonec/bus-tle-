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

	console.log( geoFactory.getCurrentPosition() );

	$scope.refresh = function() {
		geoFactory.getCurrentPosition().then(function(position) {
			var coords = position.coords;

			var mapOptions = {
				center: new google.maps.LatLng(coords.latitude, coords.longitude),
				zoom: 10,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: false
			};

			$scope.mapOptions = mapOptions;

			busstopsFactory.getLocal(coords).then(function(response) {
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
	};

	$scope.refresh();

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

.factory('busstopsFactory', ['$http', '$httpParamSerializer', 'globalsFactory', function($http, $httpParamSerializer, globalsFactory) {

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
}]);
},{}],6:[function(require,module,exports){
module.exports = angular.module('factories')

.factory('geoFactory', function($q, $window, $rootScope) {
	"ngInject";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcENvbnRyb2xsZXIuanMiLCJ3d3cvYXBwL21hcC9tYXBEaXJlY3RpdmUuanMiLCJ3d3cvYXBwL21vcmUvbW9yZUNvbnRyb2xsZXIuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9idXNzdG9wc0ZhY3RvcnkuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nZW9GYWN0b3J5LmpzIiwid3d3L2NvbW1vbi9mYWN0b3JpZXMvZ2xvYmFsc0ZhY3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnc2VydmljZXMnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdtb3JlTW9kdWxlJywgW10pO1xuXG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2dsb2JhbHNGYWN0b3J5Jyk7XG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2dlb0ZhY3RvcnknKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9mYWN0b3JpZXMvYnVzc3RvcHNGYWN0b3J5Jyk7XG5yZXF1aXJlKCcuL21hcC9tYXBDb250cm9sbGVyJyk7XG5yZXF1aXJlKCcuL21hcC9tYXBEaXJlY3RpdmUnKTtcbnJlcXVpcmUoJy4vbW9yZS9tb3JlQ29udHJvbGxlcicpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnc2VydmljZXMnLFxuXHQnZmFjdG9yaWVzJyxcblx0J21hcE1vZHVsZScsXG5cdCdtb3JlTW9kdWxlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuXHQkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cblx0XHR9XG5cdFx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHRcdC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcblx0XHRcdFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcblx0XHR9XG5cdH0pO1xufSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cblx0Ly8gSW9uaWMgdXNlcyBBbmd1bGFyVUkgUm91dGVyIHdoaWNoIHVzZXMgdGhlIGNvbmNlcHQgb2Ygc3RhdGVzXG5cdC8vIExlYXJuIG1vcmUgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyXG5cdC8vIFNldCB1cCB0aGUgdmFyaW91cyBzdGF0ZXMgd2hpY2ggdGhlIGFwcCBjYW4gYmUgaW4uXG5cdC8vIEVhY2ggc3RhdGUncyBjb250cm9sbGVyIGNhbiBiZSBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xuXHQkc3RhdGVQcm92aWRlclxuXG5cdC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcblx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGFicy90YWJzLmh0bWwnXG5cdH0pXG5cblx0Ly8gRWFjaCB0YWIgaGFzIGl0cyBvd24gbmF2IGhpc3Rvcnkgc3RhY2s6XG5cblx0LnN0YXRlKCd0YWIubWFwJywge1xuXHRcdHVybDogJy9tYXAnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1hcCc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbWFwL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTWFwQ29udHJvbGxlcidcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnKVxuXG4uY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgZ2VvRmFjdG9yeSwgYnVzc3RvcHNGYWN0b3J5KSB7XG5cblx0Y29uc29sZS5sb2coIGdlb0ZhY3RvcnkuZ2V0Q3VycmVudFBvc2l0aW9uKCkgKTtcblxuXHQkc2NvcGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuXHRcdGdlb0ZhY3RvcnkuZ2V0Q3VycmVudFBvc2l0aW9uKCkudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0dmFyIGNvb3JkcyA9IHBvc2l0aW9uLmNvb3JkcztcblxuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSB7XG5cdFx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpLFxuXHRcdFx0XHR6b29tOiAxMCxcblx0XHRcdFx0bWFwVHlwZUlkOiBnb29nbGUubWFwcy5NYXBUeXBlSWQuUk9BRE1BUCxcblx0XHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdFx0XHR9O1xuXG5cdFx0XHQkc2NvcGUubWFwT3B0aW9ucyA9IG1hcE9wdGlvbnM7XG5cblx0XHRcdGJ1c3N0b3BzRmFjdG9yeS5nZXRMb2NhbChjb29yZHMpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ1N1Y2Nlc3MnLCByZXNwb25zZSk7XG5cblx0XHRcdFx0dmFyIG1hcmtlcnMgPSBbXTtcblxuXHRcdFx0XHRhbmd1bGFyLmZvckVhY2gocmVzcG9uc2UuZGF0YS5zdG9wcywgZnVuY3Rpb24oc3RvcCkge1xuXG5cdFx0XHRcdFx0dmFyIHBvc2l0aW9uID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhzdG9wLmxhdGl0dWRlLCBzdG9wLmxvbmdpdHVkZSk7XG5cblx0XHRcdFx0XHR2YXIgbWFya2VyID0ge1xuXHRcdFx0XHRcdFx0aWQ6IHN0b3AuYXRjb2NvZGUsXG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0XHRcdFx0XHR0aXRsZTogc3RvcC5uYW1lXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1hcmtlcnMucHVzaChtYXJrZXIpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHQkc2NvcGUubWFya2VycyA9IG1hcmtlcnM7XG5cblx0XHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdFcnJvcjogJywgZXJyb3IpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH07XG5cblx0JHNjb3BlLnJlZnJlc2goKTtcblxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwTW9kdWxlJylcblxuLmRpcmVjdGl2ZSgndWlNYXAnLCBmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IGlkPVwiZ21hcHNcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PicsXG5cdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRzY29wZToge1xuXHRcdFx0b3B0aW9uczogJz0nLFxuXHRcdFx0bWFya2VyczogJz0nXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHZhciBtYXA7XG5cdFx0XHR2YXIgaW5mb1dpbmRvdztcblx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cdFx0XHR2YXIgbWFwT3B0aW9ucyA9IHNjb3BlLm9wdGlvbnM7XG5cdFx0XHR2YXIgYm91bmRzID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZ0JvdW5kcygpO1xuXG5cdFx0XHQoZnVuY3Rpb24gaW5pdE1hcCgpIHtcblx0XHRcdFx0aWYgKG1hcCA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0bWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChlbGVtZW50WzBdLCBtYXBPcHRpb25zKTtcblx0XHRcdFx0fVxuXHRcdFx0fSkoKTtcblxuXHRcdFx0ZnVuY3Rpb24gc2V0TWFya2VycygpIHtcblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHNjb3BlLm1hcmtlcnMsIGZ1bmN0aW9uKG1hcmtlcikge1xuXG5cdFx0XHRcdFx0dmFyIG1hcmtlck9wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRwb3NpdGlvbjogbWFya2VyLnBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdFx0XHR0aXRsZTogbWFya2VyLnRpdGxlLFxuXHRcdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cdFx0XHRcdFx0Ym91bmRzLmV4dGVuZChtYXJrZXIucG9zaXRpb24pO1xuXG5cdFx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHR2YXIgaW5mb1dpbmRvd09wdGlvbnM7XG5cblx0XHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93T3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0Y29udGVudDogbWFya2VyLnRpdGxlXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdy5vcGVuKG1hcCwgbWFya2VyKTtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0c2NvcGUuJHdhdGNoKGF0dHIubWFya2VycywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdjaGFuZ2VkJyk7XG5cdFx0XHRcdHNldE1hcmtlcnMoKTtcblx0XHRcdFx0bWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuXHRcdFx0XHRtYXAucGFuVG9Cb3VuZHMoYm91bmRzKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21vcmVNb2R1bGUnKVxuXG4uY29udHJvbGxlcignTW9yZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdmYWN0b3JpZXMnKVxuXG4uZmFjdG9yeSgnYnVzc3RvcHNGYWN0b3J5JywgWyckaHR0cCcsICckaHR0cFBhcmFtU2VyaWFsaXplcicsICdnbG9iYWxzRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkaHR0cFBhcmFtU2VyaWFsaXplciwgZ2xvYmFsc0ZhY3RvcnkpIHtcblxuXHR2YXIgZ2VuZXJhdGVRdWVyeU9iaiA9IGZ1bmN0aW9uKGNvb3Jkcykge1xuXHRcdHJldHVybiB7XG5cdFx0XHRsYXQ6IGNvb3Jkcy5sYXRpdHVkZSxcblx0XHRcdGxvbjogY29vcmRzLmxvbmdpdHVkZSxcblx0XHRcdGFwcF9rZXk6IGdsb2JhbHNGYWN0b3J5LmFwcF9rZXksXG5cdFx0XHRhcHBfaWQ6IGdsb2JhbHNGYWN0b3J5LmFwcF9pZFxuXHRcdH07XG5cdH07XG5cblx0cmV0dXJuIHtcblx0XHRnZXRMb2NhbDogZnVuY3Rpb24gKGNvb3Jkcykge1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0dXJsOiBnbG9iYWxzRmFjdG9yeS5hcGlfdXJsX25lYXIgKyAnPycgKyAkaHR0cFBhcmFtU2VyaWFsaXplcihnZW5lcmF0ZVF1ZXJ5T2JqKGNvb3JkcykpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59XSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2dlb0ZhY3RvcnknLCBmdW5jdGlvbigkcSwgJHdpbmRvdywgJHJvb3RTY29wZSkge1xuXHRcIm5nSW5qZWN0XCI7XG5cblx0cmV0dXJuIHtcblx0XHRnZXRDdXJyZW50UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdCRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdH1cblx0fTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cbi5mYWN0b3J5KCdnbG9iYWxzRmFjdG9yeScsIGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFwcF9pZDogJzg3OTkwOTY2Jyxcblx0XHRhcHBfa2V5OiAnMzNhNWNmOWU1NGZhNzI3NTM3ZTQ5NDFjYjA0ZDgxYzQnLFxuXHRcdGFwaV91cmxfbmVhcjogJ2h0dHA6Ly90cmFuc3BvcnRhcGkuY29tL3YzL3VrL2J1cy9zdG9wcy9uZWFyLmpzb24nXG5cdH07XG59KTsiXX0=
