(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

require('../common/services/globalsService');
require('../common/services/stopsService');
require('./map/map');
require('./more/more');


angular.module('mapApp', [
	'ionic',
	'mapApp.globalsService',
	'mapApp.stopsService',
	'mapApp.map',
	'mapApp.more'
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
				templateUrl: 'app/map/map.html',
				controller: 'MapCtrl'
			}
		}
	})

	.state('tab.more', {
		url: '/more',
		views: {
			'tab-more': {
				templateUrl: 'app/more/more.html',
				controller: 'MoreCtrl'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/tab/map');

});

},{"../common/services/globalsService":4,"../common/services/stopsService":5,"./map/map":2,"./more/more":3}],2:[function(require,module,exports){
module.exports = angular.module('mapApp.map', ['uiGmapgoogle-maps'])

.controller('MapCtrl', function($scope, stopsService) {
	$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	// busStops.get(51.534121, -0.006944).then(function(response) {
	// 	console.log(response)
	// });
});
},{}],3:[function(require,module,exports){
module.exports = angular.module('mapApp.more', [])

.controller('MoreCtrl', function($scope) {});
},{}],4:[function(require,module,exports){
module.exports = angular.module('mapApp.globalsService', [])

.service('globalsService', function() {
	return {
		appId: '87990966',
		apiKey: '33a5cf9e54fa727537e4941cb04d81c4',
		apiUrl: 'http://transportapi.com/v3/uk/bus/stops/near.json'
	};
});
},{}],5:[function(require,module,exports){
module.exports = angular.module('mapApp.stopsService', [])

.service('stopsService', function($http, globalsService) {

		// url = 'http://transportapi.com/v3/uk/bus/stops/near.json?lat=' + lat + '&lon= ' + lon + '&api_key=' + apiKey +'&app_id=' + appId;

	console.log(globalsService);

});
},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvYXBwL2FwcC5qcyIsInd3dy9hcHAvbWFwL21hcC5qcyIsInd3dy9hcHAvbW9yZS9tb3JlLmpzIiwid3d3L2NvbW1vbi9zZXJ2aWNlcy9nbG9iYWxzU2VydmljZS5qcyIsInd3dy9jb21tb24vc2VydmljZXMvc3RvcHNTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5yZXF1aXJlKCcuLi9jb21tb24vc2VydmljZXMvZ2xvYmFsc1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4uL2NvbW1vbi9zZXJ2aWNlcy9zdG9wc1NlcnZpY2UnKTtcbnJlcXVpcmUoJy4vbWFwL21hcCcpO1xucmVxdWlyZSgnLi9tb3JlL21vcmUnKTtcblxuXG5hbmd1bGFyLm1vZHVsZSgnbWFwQXBwJywgW1xuXHQnaW9uaWMnLFxuXHQnbWFwQXBwLmdsb2JhbHNTZXJ2aWNlJyxcblx0J21hcEFwcC5zdG9wc1NlcnZpY2UnLFxuXHQnbWFwQXBwLm1hcCcsXG5cdCdtYXBBcHAubW9yZSdcbl0pXG5cbi5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcblx0JGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuXHRcdFx0Y29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblx0XHRcdGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG5cdFx0fVxuXHRcdGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG5cdFx0XHQvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG5cdFx0XHRTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG5cdFx0fVxuXHR9KTtcbn0pXG5cbi5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG5cdC8vIElvbmljIHVzZXMgQW5ndWxhclVJIFJvdXRlciB3aGljaCB1c2VzIHRoZSBjb25jZXB0IG9mIHN0YXRlc1xuXHQvLyBMZWFybiBtb3JlIGhlcmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlclxuXHQvLyBTZXQgdXAgdGhlIHZhcmlvdXMgc3RhdGVzIHdoaWNoIHRoZSBhcHAgY2FuIGJlIGluLlxuXHQvLyBFYWNoIHN0YXRlJ3MgY29udHJvbGxlciBjYW4gYmUgZm91bmQgaW4gY29udHJvbGxlcnMuanNcblx0JHN0YXRlUHJvdmlkZXJcblxuXHQvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG5cdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAnYXBwL3RhYnMvdGFicy5odG1sJ1xuXHR9KVxuXG5cdC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuXG5cdC5zdGF0ZSgndGFiLm1hcCcsIHtcblx0XHR1cmw6ICcvbWFwJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tYXAnOiB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnYXBwL21hcC9tYXAuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNYXBDdHJsJ1xuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHQuc3RhdGUoJ3RhYi5tb3JlJywge1xuXHRcdHVybDogJy9tb3JlJyxcblx0XHR2aWV3czoge1xuXHRcdFx0J3RhYi1tb3JlJzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2FwcC9tb3JlL21vcmUuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdNb3JlQ3RybCdcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG5cdCR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbWFwJyk7XG5cbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwLm1hcCcsIFsndWlHbWFwZ29vZ2xlLW1hcHMnXSlcblxuLmNvbnRyb2xsZXIoJ01hcEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIHN0b3BzU2VydmljZSkge1xuXHQkc2NvcGUubWFwID0geyBjZW50ZXI6IHsgbGF0aXR1ZGU6IDQ1LCBsb25naXR1ZGU6IC03MyB9LCB6b29tOiA4IH07XG5cblx0Ly8gYnVzU3RvcHMuZ2V0KDUxLjUzNDEyMSwgLTAuMDA2OTQ0KS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG5cdC8vIFx0Y29uc29sZS5sb2cocmVzcG9uc2UpXG5cdC8vIH0pO1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwLm1vcmUnLCBbXSlcblxuLmNvbnRyb2xsZXIoJ01vcmVDdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7fSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwLmdsb2JhbHNTZXJ2aWNlJywgW10pXG5cbi5zZXJ2aWNlKCdnbG9iYWxzU2VydmljZScsIGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge1xuXHRcdGFwcElkOiAnODc5OTA5NjYnLFxuXHRcdGFwaUtleTogJzMzYTVjZjllNTRmYTcyNzUzN2U0OTQxY2IwNGQ4MWM0Jyxcblx0XHRhcGlVcmw6ICdodHRwOi8vdHJhbnNwb3J0YXBpLmNvbS92My91ay9idXMvc3RvcHMvbmVhci5qc29uJ1xuXHR9O1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBhbmd1bGFyLm1vZHVsZSgnbWFwQXBwLnN0b3BzU2VydmljZScsIFtdKVxuXG4uc2VydmljZSgnc3RvcHNTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIGdsb2JhbHNTZXJ2aWNlKSB7XG5cblx0XHQvLyB1cmwgPSAnaHR0cDovL3RyYW5zcG9ydGFwaS5jb20vdjMvdWsvYnVzL3N0b3BzL25lYXIuanNvbj9sYXQ9JyArIGxhdCArICcmbG9uPSAnICsgbG9uICsgJyZhcGlfa2V5PScgKyBhcGlLZXkgKycmYXBwX2lkPScgKyBhcHBJZDtcblxuXHRjb25zb2xlLmxvZyhnbG9iYWxzU2VydmljZSk7XG5cbn0pOyJdfQ==
