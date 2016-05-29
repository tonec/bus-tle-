describe('mapController', function() {
	var mapController;
	var scope;
	var geoService;
	var busstopsFactory;
	var passPromise;

	beforeEach(angular.mock.module('mapModule'));

	beforeEach(function() {
		angular.mock.module(function($provide) {
			$provide.factory('geoService', ['$q', function($q){
				function getCurrentPosition() {
					var position = {
						coords: {
							accuracy: 3012,
							altitude: null,
							altitudeAccuracy: null,
							heading: null,
							latitude: 51.5412621,
							longitude: -0.08813879999999999,
							speed: null
						},
						timestamp: 1464474395438
					};

					if (passPromise) {
						return $q.when(position);
					} else {
						return $q.reject('Error');
					}
				}

				return {
					getCurrentPosition: getCurrentPosition
				};
			}]);

			$provide.factory('busstopsFactory', ['$q', function($q){
				function getLocal() {
					var response = {
						data: {
							maxlat: 51.641262,
							maxlon: 0.011861,
							minlat: 51.441262,
							minlon: -0.188139,
							page: 1,
							request_time : "2016-05-29T17:54:42+01:00",
							rpp: 25,
							searchlat: 51.541262,
							searchlon: -0.088139,
							stops: [{
								"atcocode":"490018480SE",
								"smscode":"",
								"name":"Halliford Street / Oxford Arms",
								"mode":"bus",
								"bearing":"SE",
								"locality":"De Beauvoir Town",
								"indicator":"->SE",
								"longitude":-0.08954,
								"latitude":51.5402,
								"distance":153
								}, {
								"atcocode":"490018480NW",
								"smscode":"",
								"name":"Halliford Street / Oxford Arms",
								"mode":"bus",
								"bearing":"NW",
								"locality":"De Beauvoir Town",
								"indicator":"->NW",
								"longitude":-0.08945,
								"latitude":51.5401,
								"distance":158
							}],
							total: 5623
						}
					};

					if (true) {
						return $q.when(response);
					} else {
						return $q.reject('Error');
					}
				}

				return {
					getLocal: getLocal
				};
			}]);
		});
	});

	beforeEach(inject(function($rootScope, $controller, geoService, busstopsFactory) {
		scope = $rootScope.$new();
		mockGeoService = geoService;
		mockBusstopsFactory = busstopsFactory;

		spyOn(mockGeoService, 'getCurrentPosition').and.callThrough();
		spyOn(mockBusstopsFactory, 'getLocal').and.callThrough();

		mapController = $controller('MapController', {
			$scope: scope,
			geoService: mockGeoService,
			busstopsFactory: mockBusstopsFactory
		});
	}));

	it('should have a method to get the current position', function() {
		expect(mapController.getPosition).toBeDefined();
	});

	it('should get and set the position property on scope', function() {
		passPromise = true;
		scope.getPosition();
		scope.$digest();

		expect(scope.position).toBeDefined();
	});

	it('should set the coords property on scope.position', function() {
		passPromise = true;
		scope.getPosition();
		scope.$digest();

		expect(scope.position.coords).toBeDefined();
		expect(scope.position.coords.latitude).toBe(51.5412621);
	});

	it('should populate an error property on error', function() {
		passPromise = false;
		scope.getPosition();
		scope.$digest();

		expect(scope.error).toBe('There has been an error.');
	});

	it('should have a method to get bus stops nearby', function() {
		expect(mapController.getBusStopsNearby).toBeDefined();
	});

	it('should have a buildMap method', function() {
		expect(mapController.buildMap).toBeDefined();
	});

	it('should give access to getPosition on the scope', function() {
		expect(scope.getPosition).toBeDefined();
	});
});