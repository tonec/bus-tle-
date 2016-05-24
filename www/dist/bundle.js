(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('services', []);
angular.module('factories', []);
angular.module('mapModule', []);
angular.module('moreModule', []);

require('../common/factories/globalsFactory');
require('../common/factories/geoFactory');
require('../common/factories/busstopsFactory');
require('./map/controllers');
require('./map/directives');
require('./more/controllers');

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

},{"../common/factories/busstopsFactory":5,"../common/factories/geoFactory":6,"../common/factories/globalsFactory":7,"./map/controllers":2,"./map/directives":3,"./more/controllers":4}],2:[function(require,module,exports){
module.exports = angular.module('mapModule')

.controller('MapController', function($scope, geoFactory, busstopsFactory) {

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

.factory('geoFactory', ['$q', '$window', function($q, $window) {
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
module.exports = angular.module('factories')

.factory('globalsFactory', function() {
	return {
		app_id: '87990966',
		app_key: '33a5cf9e54fa727537e4941cb04d81c4',
		api_url_near: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwid3d3L2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInd3dy9hcHAvbW9yZS9jb250cm9sbGVycy5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2J1c3N0b3BzRmFjdG9yeS5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2dlb0ZhY3RvcnkuanMiLCJ3d3cvY29tbW9uL2ZhY3Rvcmllcy9nbG9iYWxzRmFjdG9yeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3NlcnZpY2VzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbW9yZU1vZHVsZScsIFtdKTtcblxucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9nbG9iYWxzRmFjdG9yeScpO1xucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9nZW9GYWN0b3J5Jyk7XG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2J1c3N0b3BzRmFjdG9yeScpO1xucmVxdWlyZSgnLi9tYXAvY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vbWFwL2RpcmVjdGl2ZXMnKTtcbnJlcXVpcmUoJy4vbW9yZS9jb250cm9sbGVycycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYnVzdGxlQXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnc2VydmljZXMnLFxuXHQnZmFjdG9yaWVzJyxcblx0J21hcE1vZHVsZScsXG5cdCdtb3JlTW9kdWxlJ1xuXSlcblxuLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuXHQkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcblx0XHRpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cblx0XHR9XG5cdFx0aWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcblx0XHRcdC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcblx0XHRcdFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcblx0XHR9XG5cdH0pO1xufSlcblxuLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cblx0Ly8gSW9uaWMgdXNlcyBBbmd1bGFyVUkgUm91dGVyIHdoaWNoIHVzZXMgdGhlIGNvbmNlcHQgb2Ygc3RhdGVzXG5cdC8vIExlYXJuIG1vcmUgaGVyZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyXG5cdC8vIFNldCB1cCB0aGUgdmFyaW91cyBzdGF0ZXMgd2hpY2ggdGhlIGFwcCBjYW4gYmUgaW4uXG5cdC8vIEVhY2ggc3RhdGUncyBjb250cm9sbGVyIGNhbiBiZSBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xuXHQkc3RhdGVQcm92aWRlclxuXG5cdC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcblx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0dGVtcGxhdGVVcmw6ICdhcHAvdGFicy90YWJzLmh0bWwnXG5cdH0pXG5cblx0Ly8gRWFjaCB0YWIgaGFzIGl0cyBvd24gbmF2IGhpc3Rvcnkgc3RhY2s6XG5cblx0LnN0YXRlKCd0YWIubWFwJywge1xuXHRcdHVybDogJy9tYXAnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1hcCc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbWFwL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTWFwQ29udHJvbGxlcidcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cblx0LnN0YXRlKCd0YWIubW9yZScsIHtcblx0XHR1cmw6ICcvbW9yZScsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbW9yZSc6IHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICdhcHAvbW9yZS92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01vcmVDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Ly8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcblx0JHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9tYXAnKTtcblxufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBNb2R1bGUnKVxuXG4uY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgZ2VvRmFjdG9yeSwgYnVzc3RvcHNGYWN0b3J5KSB7XG5cblx0JHNjb3BlLnJlZnJlc2ggPSBmdW5jdGlvbigpIHtcblx0XHRnZW9GYWN0b3J5LmdldEN1cnJlbnRQb3NpdGlvbigpLnRoZW4oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdHZhciBjb29yZHMgPSBwb3NpdGlvbi5jb29yZHM7XG5cblx0XHRcdHZhciBtYXBPcHRpb25zID0ge1xuXHRcdFx0XHRjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoY29vcmRzLmxhdGl0dWRlLCBjb29yZHMubG9uZ2l0dWRlKSxcblx0XHRcdFx0em9vbTogMTAsXG5cdFx0XHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXG5cdFx0XHRcdHNjcm9sbHdoZWVsOiBmYWxzZVxuXHRcdFx0fTtcblxuXHRcdFx0JHNjb3BlLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdFx0XHRidXNzdG9wc0ZhY3RvcnkuZ2V0TG9jYWwoY29vcmRzKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCdTdWNjZXNzJywgcmVzcG9uc2UpO1xuXG5cdFx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cblx0XHRcdFx0YW5ndWxhci5mb3JFYWNoKHJlc3BvbnNlLmRhdGEuc3RvcHMsIGZ1bmN0aW9uKHN0b3ApIHtcblxuXHRcdFx0XHRcdHZhciBwb3NpdGlvbiA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RvcC5sYXRpdHVkZSwgc3RvcC5sb25naXR1ZGUpO1xuXG5cdFx0XHRcdFx0dmFyIG1hcmtlciA9IHtcblx0XHRcdFx0XHRcdGlkOiBzdG9wLmF0Y29jb2RlLFxuXHRcdFx0XHRcdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdFx0XHRcdFx0dGl0bGU6IHN0b3AubmFtZVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXJzLnB1c2gobWFya2VyKTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLm1hcmtlcnMgPSBtYXJrZXJzO1xuXG5cdFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnRXJyb3I6ICcsIGVycm9yKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdCRzY29wZS5yZWZyZXNoKCk7XG5cbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcE1vZHVsZScpXG5cbi5kaXJlY3RpdmUoJ3VpTWFwJywgZnVuY3Rpb24oKSB7XG5cblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlOiAnPGRpdiBpZD1cImdtYXBzXCIgY2xhc3M9XCJtYXBcIj48L2Rpdj4nLFxuXHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9wdGlvbnM6ICc9Jyxcblx0XHRcdG1hcmtlcnM6ICc9J1xuXHRcdH0sXG5cdFx0bGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyKSB7XG5cdFx0XHR2YXIgbWFwO1xuXHRcdFx0dmFyIGluZm9XaW5kb3c7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXHRcdFx0dmFyIGJvdW5kcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmdCb3VuZHMoKTtcblxuXHRcdFx0KGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pKCk7XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcnMoKSB7XG5cdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChzY29wZS5tYXJrZXJzLCBmdW5jdGlvbihtYXJrZXIpIHtcblxuXHRcdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0cG9zaXRpb246IG1hcmtlci5wb3NpdGlvbixcblx0XHRcdFx0XHRcdG1hcDogbWFwLFxuXHRcdFx0XHRcdFx0dGl0bGU6IG1hcmtlci50aXRsZSxcblx0XHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKG1hcmtlck9wdGlvbnMpO1xuXHRcdFx0XHRcdGJvdW5kcy5leHRlbmQobWFya2VyLnBvc2l0aW9uKTtcblxuXHRcdFx0XHRcdGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zO1xuXG5cdFx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IG1hcmtlci50aXRsZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHNjb3BlLiR3YXRjaChhdHRyLm1hcmtlcnMsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZygnY2hhbmdlZCcpO1xuXHRcdFx0XHRzZXRNYXJrZXJzKCk7XG5cdFx0XHRcdG1hcC5maXRCb3VuZHMoYm91bmRzKTtcblx0XHRcdFx0bWFwLnBhblRvQm91bmRzKGJvdW5kcyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtb3JlTW9kdWxlJylcblxuLmNvbnRyb2xsZXIoJ01vcmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7fSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2J1c3N0b3BzRmFjdG9yeScsIFsnJGh0dHAnLCAnJGh0dHBQYXJhbVNlcmlhbGl6ZXInLCAnZ2xvYmFsc0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJGh0dHBQYXJhbVNlcmlhbGl6ZXIsIGdsb2JhbHNGYWN0b3J5KSB7XG5cblx0dmFyIGdlbmVyYXRlUXVlcnlPYmogPSBmdW5jdGlvbihjb29yZHMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bGF0OiBjb29yZHMubGF0aXR1ZGUsXG5cdFx0XHRsb246IGNvb3Jkcy5sb25naXR1ZGUsXG5cdFx0XHRhcHBfa2V5OiBnbG9iYWxzRmFjdG9yeS5hcHBfa2V5LFxuXHRcdFx0YXBwX2lkOiBnbG9iYWxzRmFjdG9yeS5hcHBfaWRcblx0XHR9O1xuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0Z2V0TG9jYWw6IGZ1bmN0aW9uIChjb29yZHMpIHtcblx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdHVybDogZ2xvYmFsc0ZhY3RvcnkuYXBpX3VybF9uZWFyICsgJz8nICsgJGh0dHBQYXJhbVNlcmlhbGl6ZXIoZ2VuZXJhdGVRdWVyeU9iaihjb29yZHMpKVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9O1xufV0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2ZhY3RvcmllcycpXG5cbi5mYWN0b3J5KCdnZW9GYWN0b3J5JywgWyckcScsICckd2luZG93JywgZnVuY3Rpb24oJHEsICR3aW5kb3cpIHtcblx0cmV0dXJuIHtcblx0XHRnZXRDdXJyZW50UG9zaXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuXHRcdFx0JHdpbmRvdy5uYXZpZ2F0b3IuZ2VvbG9jYXRpb24uZ2V0Q3VycmVudFBvc2l0aW9uKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xuXHRcdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVqZWN0KGVycm9yKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblx0XHR9XG5cdH07XG59XSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZmFjdG9yaWVzJylcblxuLmZhY3RvcnkoJ2dsb2JhbHNGYWN0b3J5JywgZnVuY3Rpb24oKSB7XG5cdHJldHVybiB7XG5cdFx0YXBwX2lkOiAnODc5OTA5NjYnLFxuXHRcdGFwcF9rZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpX3VybF9uZWFyOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0pOyJdfQ==
