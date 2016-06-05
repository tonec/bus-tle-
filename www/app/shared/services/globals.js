(function() {

	angular.module('bustleApp.services')
		.constant('globals', {
			app_id: '87990966',
			app_key: '33a5cf9e54fa727537e4941cb04d81c4',
			api_url: 'http://transportapi.com/v3',
			api_bus: {
				near: '/uk/bus/stops/near.json',
				live: '/uk/bus/stop/{atcocode}/live.json',
				timetable: '/uk/bus/stop/{atcocode}/{date}/{time}/timetable.json',
				route: '/uk/bus/route/{operator}/{line}/{direction}/{atcocode}/{date}/{time}/timetable.json',
				bbox: '/uk/bus/stops/bbox.json'
			},
			api_tube: {
				near: '/uk/tube/stations/near.json',
				bbox: '/uk/tube/stations/bbox.json'
			},
			api_journey: {
				fromTo: '/uk/public/journey/from/{from}/to/{to}.json',
				fromToType: '/uk/public/journey/from/{from}/to/{to}/{type}/{date}/{time}.json'
			}
		});

})();