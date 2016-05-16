(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

angular.module('globals', []);
angular.module('geo', []);
angular.module('mapApp', []);
angular.module('moreApp', []);

require('../common/services/Globals');
require('../common/services/Geo');
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

},{"../common/services/Geo":5,"../common/services/Globals":6,"./map/controllers":2,"./map/directives":3,"./more/controllers":4}],2:[function(require,module,exports){
module.exports = angular.module('mapApp')

.controller('MapController', function($scope, Globals, Geo) {

	Geo.getCurrentPosition().then(function(position) {
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

.factory('Geo', ['$q', '$window', function($q, $window) {
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

.factory('Globals', function() {
	return {
		appId: '87990966',
		apiKey: '33a5cf9e54fa727537e4941cb04d81c4',
		apiUrl: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwid3d3L2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInd3dy9hcHAvbW9yZS9jb250cm9sbGVycy5qcyIsInd3dy9jb21tb24vc2VydmljZXMvR2VvLmpzIiwid3d3L2NvbW1vbi9zZXJ2aWNlcy9HbG9iYWxzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnZ2xvYmFscycsIFtdKTtcbmFuZ3VsYXIubW9kdWxlKCdnZW8nLCBbXSk7XG5hbmd1bGFyLm1vZHVsZSgnbWFwQXBwJywgW10pO1xuYW5ndWxhci5tb2R1bGUoJ21vcmVBcHAnLCBbXSk7XG5cbnJlcXVpcmUoJy4uL2NvbW1vbi9zZXJ2aWNlcy9HbG9iYWxzJyk7XG5yZXF1aXJlKCcuLi9jb21tb24vc2VydmljZXMvR2VvJyk7XG5yZXF1aXJlKCcuL21hcC9jb250cm9sbGVycycpO1xucmVxdWlyZSgnLi9tYXAvZGlyZWN0aXZlcycpO1xucmVxdWlyZSgnLi9tb3JlL2NvbnRyb2xsZXJzJyk7XG5cbmFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbXG5cdCdpb25pYycsXG5cdCdnbG9iYWxzJyxcblx0J2dlbycsXG5cdCdtYXBBcHAnLFxuXHQnbW9yZUFwcCdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcblx0JGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG5cdFx0fVxuXHRcdGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG5cdFx0XHQvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG5cdFx0XHRTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG5cdC8vIElvbmljIHVzZXMgQW5ndWxhclVJIFJvdXRlciB3aGljaCB1c2VzIHRoZSBjb25jZXB0IG9mIHN0YXRlc1xuXHQvLyBMZWFybiBtb3JlIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlclxuXHQvLyBTZXQgdXAgdGhlIHZhcmlvdXMgc3RhdGVzIHdoaWNoIHRoZSBhcHAgY2FuIGJlIGluLlxuXHQvLyBFYWNoIHN0YXRlJ3MgY29udHJvbGxlciBjYW4gYmUgZm91bmQgaW4gY29udHJvbGxlcnMuanNcblx0JHN0YXRlUHJvdmlkZXJcblxuXHQvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG5cdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RhYnMvdGFicy5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC92aWV3cy9pbmRleC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ01hcENvbnRyb2xsZXInXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxuXG5cdC5zdGF0ZSgndGFiLm1vcmUnLCB7XG5cdFx0dXJsOiAnL21vcmUnLFxuXHRcdHZpZXdzOiB7XG5cdFx0XHQndGFiLW1vcmUnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21vcmUvdmlld3MvaW5kZXguaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNb3JlQ29udHJvbGxlcidcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG5cdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbWFwJyk7XG5cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwJylcblxuLmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEdsb2JhbHMsIEdlbykge1xuXG5cdEdlby5nZXRDdXJyZW50UG9zaXRpb24oKS50aGVuKGZ1bmN0aW9uKHBvc2l0aW9uKSB7XG5cdFx0dmFyIGNvb3JkcyA9IHBvc2l0aW9uLmNvb3JkcztcblxuXHRcdHZhciBtYXBPcHRpb25zID0ge1xuXHRcdFx0Y2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGNvb3Jkcy5sYXRpdHVkZSwgY29vcmRzLmxvbmdpdHVkZSksXG5cdFx0XHR6b29tOiAxMCxcblx0XHRcdG1hcFR5cGVJZDogZ29vZ2xlLm1hcHMuTWFwVHlwZUlkLlJPQURNQVAsXG5cdFx0XHRzY3JvbGx3aGVlbDogZmFsc2Vcblx0XHR9O1xuXG5cdFx0JHNjb3BlLm1hcE9wdGlvbnMgPSBtYXBPcHRpb25zO1xuXG5cdH0pO1xuXG5cblxuXHQvLyB1cmwgPSAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbj9sYXQ9JyArIGxhdCArICcmbG9uPSAnICsgbG9uICsgJyZhcGlfa2V5PScgKyBhcGlLZXkgKycmYXBwX2lkPScgKyBhcHBJZDtcblxuXHQvLyBidXNTdG9wcy5nZXQoNTEuNTM0MTIxLCAtMC4wMDY5NDQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0Ly8gXHRjb25zb2xlLmxvZyhyZXNwb25zZSlcblx0Ly8gfSk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtYXBBcHAnKVxuXG4uZGlyZWN0aXZlKCd1aU1hcCcsIGZ1bmN0aW9uKCkge1xuXG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6ICdFJyxcblx0XHR0ZW1wbGF0ZTogJzxkaXYgaWQ9XCJnbWFwc1wiIGNsYXNzPVwibWFwXCI+PC9kaXY+Jyxcblx0XHRyZXBsYWNlOiB0cnVlLFxuXHRcdHNjb3BlOiB7XG5cdFx0XHRvcHRpb25zOiAnPSdcblx0XHR9LFxuXHRcdGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cikge1xuXHRcdFx0dmFyIG1hcDtcblx0XHRcdHZhciBtYXJrZXJzID0gW107XG5cdFx0XHR2YXIgbWFwT3B0aW9ucyA9IHNjb3BlLm9wdGlvbnM7XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRNYXAoKSB7XG5cdFx0XHRcdGlmIChtYXAgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRcdG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZWxlbWVudFswXSwgbWFwT3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gc2V0TWFya2VyKG1hcCwgcG9zaXRpb24sIHRpdGxlLCBjb250ZW50KSB7XG5cdFx0XHRcdHZhciBtYXJrZXI7XG5cdFx0XHRcdHZhciBtYXJrZXJPcHRpb25zID0ge1xuXHRcdFx0XHRcdHBvc2l0aW9uOiBwb3NpdGlvbixcblx0XHRcdFx0XHRtYXA6IG1hcCxcblx0XHRcdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRcdFx0aWNvbjogJ2h0dHBzOi8vbWFwcy5nb29nbGUuY29tL21hcGZpbGVzL21zL2ljb25zL2dyZWVuLWRvdC5wbmcnXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0bWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcihtYXJrZXJPcHRpb25zKTtcblx0XHRcdFx0bWFya2Vycy5wdXNoKG1hcmtlcik7IC8vIGFkZCBtYXJrZXIgdG8gYXJyYXlcblxuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0XHRcdGlmIChpbmZvV2luZG93ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdGluZm9XaW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR2YXIgaW5mb1dpbmRvd09wdGlvbnMgPSB7XG5cdFx0XHRcdFx0XHRjb250ZW50OiBjb250ZW50XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpbmZvV2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coaW5mb1dpbmRvd09wdGlvbnMpO1xuXHRcdFx0XHRcdGluZm9XaW5kb3cub3BlbihtYXAsIG1hcmtlcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRpbml0TWFwKCk7XG5cblx0XHRcdHNldE1hcmtlcihtYXAsIG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNTEuNTA4NTE1LCAtMC4xMjU0ODcpLCAnTG9uZG9uJywgJ0p1c3Qgc29tZSBjb250ZW50Jyk7XG5cdFx0fVxuXHR9O1xuXG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGFuZ3VsYXIubW9kdWxlKCdtb3JlQXBwJylcblxuLmNvbnRyb2xsZXIoJ01vcmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7fSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnZ2VvJylcblxuLmZhY3RvcnkoJ0dlbycsIFsnJHEnLCAnJHdpbmRvdycsIGZ1bmN0aW9uKCRxLCAkd2luZG93KSB7XG5cdHJldHVybiB7XG5cdFx0Z2V0Q3VycmVudFBvc2l0aW9uOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cblx0XHRcdCR3aW5kb3cubmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHBvc2l0aW9uKTtcblx0XHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHRcdGRlZmVycmVkLnJlamVjdChlcnJvcik7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cdFx0fVxuXHR9O1xufV0pOyIsIm1vZHVsZS5leHBvcnRzID0gYW5ndWxhci5tb2R1bGUoJ2dsb2JhbHMnKVxuXG4uZmFjdG9yeSgnR2xvYmFscycsIGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFwcElkOiAnODc5OTA5NjYnLFxuXHRcdGFwaUtleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlVcmw6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSk7Il19
