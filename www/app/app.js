(function() {
	'use strict';

	angular.module('bustleApp.services', []);
	angular.module('bustleApp.mapModule', []);
	angular.module('bustleApp.listModule', []);
	angular.module('bustleApp.moreModule', []);

	angular.module('bustleApp', [
		'ionic',
		'bustleApp.services',
		'bustleApp.mapModule',
		'bustleApp.listModule',
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
			templateUrl: 'app/tabs/tabs.tpl.html'
		})

		// Each tab has its own nav history stack:

		.state('tab.map', {
			url: '/map',
			views: {
				'tab-map': {
					templateUrl: 'app/map/map.tpl.html',
					controller: 'MapController',
					controllerAs: 'mapVm'
				}
			}
		})

		.state('tab.list', {
			url: '/list',
			views: {
				'tab-list': {
					templateUrl: 'app/list/list.tpl.html',
					controller: 'ListController',
					controllerAs: 'listVm'
				}
			}
		})

		.state('tab.more', {
			url: '/more',
			views: {
				'tab-more': {
					templateUrl: 'app/more/more.tpl.html',
					controller: 'MoreController',
					controllerAs: 'moreVm'
				}
			}
		});

		// if none of the above states are matched, use this as the fallback
		$urlRouterProvider.otherwise('/tab/map');

	});

})();

