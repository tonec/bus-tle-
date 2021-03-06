// Karma configuration
// Generated on Tue May 24 2016 14:31:10 GMT+0100 (BST)

module.exports = function(config) {
  config.set({

	// base path that will be used to resolve all patterns (eg. files, exclude)
	basePath: '',


	// frameworks to use
	// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
	frameworks: ['jasmine'],


	// list of files / patterns to load in the browser
	files: [
		'http://maps.googleapis.com/maps/api/js?key=AIzaSyCew1S5EW8N24hcfM2U2o0d2lHSLKUj4Q4',
		'./www/lib/ionic/js/ionic.bundle.js',
		'./www/lib/underscore/underscore-min.js',
		'./www/lib/underscore/underscore-min.js',
		'./node_modules/angular-mocks/angular-mocks.js',
		'./www/app/**/*.js'
	],


	// list of files to exclude
	exclude: [
	],


	// preprocess matching files before serving them to the browser
	// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
	preprocessors: {
	},


	// test results reporter to use
	// possible values: 'dots', 'progress'
	// available reporters: https://npmjs.org/browse/keyword/karma-reporter
	reporters: ['spec'],


	// web server port
	port: 9876,


	// enable / disable colors in the output (reporters and logs)
	colors: true,


	// level of logging
	// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
	logLevel: config.LOG_INFO,


	// enable / disable watching file and executing tests whenever any file changes
	autoWatch: true,


	// start these browsers
	// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
	browsers: [
		// 'Chrome',
		// 'Firefox',
		'PhantomJS'
	],


	// Continuous Integration mode
	// if true, Karma captures browsers, runs the tests and exits
	singleRun: false,

	// Concurrency level
	// how many browser should be started simultaneous
	concurrency: Infinity,

	browserify: {
		debug: true,
		transform: [ 'brfs' ]
	}
  })
}
