(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('globals', []);
angular.module('geo', []);
angular.module('mapApp', []);
angular.module('moreApp', []);

require('../common/factories/globals');
require('../common/factories/geo');
require('./map/controllers');
require('./map/directives');
require('./more/controllers');

angular.module('app', [
	'ionic',
	'globals',
	'geo',
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

},{"../common/factories/geo":5,"../common/factories/globals":6,"./map/controllers":2,"./map/directives":3,"./more/controllers":4}],2:[function(require,module,exports){
module.exports = angular.module('mapApp')

.controller('MapController', function($scope, globals, geo) {

	geo.getCurrentPosition().then(function(position) {
		var coords = position.coords;

		var mapOptions = {
			center: new google.maps.LatLng(coords.latitude, coords.longitude),
			zoom: 10,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false
		};

		$scope.mapOptions = mapOptions;

	});



	// url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat=' + lat + '&lon= ' + lon + '&api_key=' + apiKey +'&app_id=' + appId;

	// busStops.get(51.534121, -0.006944).then(function(response) {
	// 	console.log(response)
	// });
});
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapApp')

.directive('uiMap', function() {

	return {
		restrict: 'E',
		template: '<div id="gmaps" class="map"></div>',
		replace: true,
		scope: {
			options: '='
		},
		link: function (scope, element, attr) {
			var map;
			var markers = [];
			var mapOptions = scope.options;

			function initMap() {
				if (map === void 0) {
					map = new google.maps.Map(element[0], mapOptions);
				}
			}

			function setMarker(map, position, title, content) {
				var marker;
				var markerOptions = {
					position: position,
					map: map,
					title: title,
					icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
				};

				marker = new google.maps.Marker(markerOptions);
				markers.push(marker); // add marker to array

				google.maps.event.addListener(marker, 'click', function () {

					if (infoWindow !== void 0) {
						infoWindow.close();
					}

					var infoWindowOptions = {
						content: content
					};
					infoWindow = new google.maps.InfoWindow(infoWindowOptions);
					infoWindow.open(map, marker);
				});
			}

			initMap();

			setMarker(map, new google.maps.LatLng(51.508515, -0.125487), 'London', 'Just some content');
		}
	};

});
},{}],4:[function(require,module,exports){
module.exports = angular.module('moreApp')

.controller('MoreController', function($scope) {});
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
module.exports = angular.module('globals')

.factory('globals', function() {
	return {
		appId: '87990966',
		apiKey: '33a5cf9e54fa727537e4941cb04d81c4',
		apiUrl: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwid3d3L2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInd3dy9hcHAvbW9yZS9jb250cm9sbGVycy5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2dlby5qcyIsInd3dy9jb21tb24vZmFjdG9yaWVzL2dsb2JhbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdnbG9iYWxzJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ2dlbycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdtYXBBcHAnLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbW9yZUFwcCcsIFtdKTtcblxucmVxdWlyZSgnLi4vY29tbW9uL2ZhY3Rvcmllcy9nbG9iYWxzJyk7XG5yZXF1aXJlKCcuLi9jb21tb24vZmFjdG9yaWVzL2dlbycpO1xucmVxdWlyZSgnLi9tYXAvY29udHJvbGxlcnMnKTtcbnJlcXVpcmUoJy4vbWFwL2RpcmVjdGl2ZXMnKTtcbnJlcXVpcmUoJy4vbW9yZS9jb250cm9sbGVycycpO1xuXG5hbmd1bGFyLm1vZHVsZSgnYXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnZ2xvYmFscycsXG5cdCdnZW8nLFxuXHQnbWFwQXBwJyxcblx0J21vcmVBcHAnXG5dKVxuXG4ucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG5cdCRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHRcdGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cdFx0XHRjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuXHRcdH1cblx0XHRpZiAod2luZG93LlN0YXR1c0Jhcikge1xuXHRcdFx0Ly8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuXHRcdFx0U3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuXHRcdH1cblx0fSk7XG59KVxuXG4uY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuXHQvLyBJb25pYyB1c2VzIEFuZ3VsYXJVSSBSb3V0ZXIgd2hpY2ggdXNlcyB0aGUgY29uY2VwdCBvZiBzdGF0ZXNcblx0Ly8gTGVhcm4gbW9yZSBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXJcblx0Ly8gU2V0IHVwIHRoZSB2YXJpb3VzIHN0YXRlcyB3aGljaCB0aGUgYXBwIGNhbiBiZSBpbi5cblx0Ly8gRWFjaCBzdGF0ZSdzIGNvbnRyb2xsZXIgY2FuIGJlIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG5cdCRzdGF0ZVByb3ZpZGVyXG5cblx0Ly8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuXHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2FwcC90YWJzL3RhYnMuaHRtbCdcblx0fSlcblxuXHQvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcblxuXHQuc3RhdGUoJ3RhYi5tYXAnLCB7XG5cdFx0dXJsOiAnL21hcCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCd0YWItbWFwJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tYXAvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDb250cm9sbGVyJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL3ZpZXdzL2luZGV4Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTW9yZUNvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuXHQkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL21hcCcpO1xuXG59KTtcbiIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ21hcEFwcCcpXG5cbi5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxzLCBnZW8pIHtcblxuXHRnZW8uZ2V0Q3VycmVudFBvc2l0aW9uKCkudGhlbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdHZhciBjb29yZHMgPSBwb3NpdGlvbi5jb29yZHM7XG5cblx0XHR2YXIgbWFwT3B0aW9ucyA9IHtcblx0XHRcdGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhjb29yZHMubGF0aXR1ZGUsIGNvb3Jkcy5sb25naXR1ZGUpLFxuXHRcdFx0em9vbTogMTAsXG5cdFx0XHRtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQLFxuXHRcdFx0c2Nyb2xsd2hlZWw6IGZhbHNlXG5cdFx0fTtcblxuXHRcdCRzY29wZS5tYXBPcHRpb25zID0gbWFwT3B0aW9ucztcblxuXHR9KTtcblxuXG5cblx0Ly8gdXJsID0gJ2h0dHA6Ly90cmFuc3BvcnRhcGkuY29tL3YzL3VrL2J1cy9zdG9wcy9uZWFyLmpzb24/bGF0PScgKyBsYXQgKyAnJmxvbj0gJyArIGxvbiArICcmYXBpX2tleT0nICsgYXBpS2V5ICsnJmFwcF9pZD0nICsgYXBwSWQ7XG5cblx0Ly8gYnVzU3RvcHMuZ2V0KDUxLjUzNDEyMSwgLTAuMDA2OTQ0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdC8vIFx0Y29uc29sZS5sb2cocmVzcG9uc2UpXG5cdC8vIH0pO1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwJylcblxuLmRpcmVjdGl2ZSgndWlNYXAnLCBmdW5jdGlvbigpIHtcblxuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGU6ICc8ZGl2IGlkPVwiZ21hcHNcIiBjbGFzcz1cIm1hcFwiPjwvZGl2PicsXG5cdFx0cmVwbGFjZTogdHJ1ZSxcblx0XHRzY29wZToge1xuXHRcdFx0b3B0aW9uczogJz0nXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHIpIHtcblx0XHRcdHZhciBtYXA7XG5cdFx0XHR2YXIgbWFya2VycyA9IFtdO1xuXHRcdFx0dmFyIG1hcE9wdGlvbnMgPSBzY29wZS5vcHRpb25zO1xuXG5cdFx0XHRmdW5jdGlvbiBpbml0TWFwKCkge1xuXHRcdFx0XHRpZiAobWFwID09PSB2b2lkIDApIHtcblx0XHRcdFx0XHRtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGVsZW1lbnRbMF0sIG1hcE9wdGlvbnMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHNldE1hcmtlcihtYXAsIHBvc2l0aW9uLCB0aXRsZSwgY29udGVudCkge1xuXHRcdFx0XHR2YXIgbWFya2VyO1xuXHRcdFx0XHR2YXIgbWFya2VyT3B0aW9ucyA9IHtcblx0XHRcdFx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdFx0dGl0bGU6IHRpdGxlLFxuXHRcdFx0XHRcdGljb246ICdodHRwczovL21hcHMuZ29vZ2xlLmNvbS9tYXBmaWxlcy9tcy9pY29ucy9ncmVlbi1kb3QucG5nJ1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIobWFya2VyT3B0aW9ucyk7XG5cdFx0XHRcdG1hcmtlcnMucHVzaChtYXJrZXIpOyAvLyBhZGQgbWFya2VyIHRvIGFycmF5XG5cblx0XHRcdFx0Z29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cblx0XHRcdFx0XHRpZiAoaW5mb1dpbmRvdyAhPT0gdm9pZCAwKSB7XG5cdFx0XHRcdFx0XHRpbmZvV2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyIGluZm9XaW5kb3dPcHRpb25zID0ge1xuXHRcdFx0XHRcdFx0Y29udGVudDogY29udGVudFxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0aW5mb1dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KGluZm9XaW5kb3dPcHRpb25zKTtcblx0XHRcdFx0XHRpbmZvV2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aW5pdE1hcCgpO1xuXG5cdFx0XHRzZXRNYXJrZXIobWFwLCBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDUxLjUwODUxNSwgLTAuMTI1NDg3KSwgJ0xvbmRvbicsICdKdXN0IHNvbWUgY29udGVudCcpO1xuXHRcdH1cblx0fTtcblxufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbW9yZUFwcCcpXG5cbi5jb250cm9sbGVyKCdNb3JlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge30pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2dlbycpXG5cbi5mYWN0b3J5KCdnZW8nLCBbJyRxJywgJyR3aW5kb3cnLCBmdW5jdGlvbigkcSwgJHdpbmRvdykge1xuXHRyZXR1cm4ge1xuXHRcdGdldEN1cnJlbnRQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG5cdFx0XHQkd2luZG93Lm5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24ocG9zaXRpb24pIHtcblx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZShwb3NpdGlvbik7XG5cdFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoZXJyb3IpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXHRcdH1cblx0fTtcbn1dKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdnbG9iYWxzJylcblxuLmZhY3RvcnkoJ2dsb2JhbHMnLCBmdW5jdGlvbigpIHtcblx0cmV0dXJuIHtcblx0XHRhcHBJZDogJzg3OTkwOTY2Jyxcblx0XHRhcGlLZXk6ICczM2E1Y2Y5ZTU0ZmE3Mjc1MzdlNDk0MWNiMDRkODFjNCcsXG5cdFx0YXBpVXJsOiAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbidcblx0fTtcbn0pOyJdfQ==
