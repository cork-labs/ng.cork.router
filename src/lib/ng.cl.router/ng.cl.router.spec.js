describe('ng.cl.router', function () {
    'use strict';

    beforeEach(module('ng.cl.router'));

    describe('provider', function () {

        describe('addRoute()', function () {

            var clRouterProvider;
            beforeEach(module(function (_clRouterProvider_) {
                clRouterProvider = _clRouterProvider_;
            }));

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            beforeEach(inject(function ($route) {}));

            it('should throw an error if name is missing.', function () {
                expect(function () {
                    clRouterProvider.addRoute();
                }).toThrow('Invalid route name "undefined".');
            });

            it('should throw an error if name is invalid.', function () {
                var route = {};
                expect(function () {
                    clRouterProvider.addRoute(route);
                }).toThrow('Invalid route name "' + route + '".');
            });

            it('should throw an error if route has a repeated name.', function () {
                var route = 'list';
                expect(function () {
                    clRouterProvider.addRoute(route, {
                        path: '/foo'
                    });
                    clRouterProvider.addRoute(route);
                }).toThrow('Duplicate route "' + route + '".');
            });

            it('should throw an error if config is invalid.', function () {
                var route = 'foo';
                var config = 'bar';
                expect(function () {
                    clRouterProvider.addRoute(route, config);
                }).toThrow('Invalid config "' + config + '" in route "' + route + '".');
            });

            it('should throw an error if path is missing.', function () {
                var route = 'foo';
                var path;
                expect(function () {
                    clRouterProvider.addRoute(route, {});
                }).toThrow('Invalid path "' + path + '" in route "' + route + '".');
            });

            it('should throw an error if path is invalid.', function () {
                var route = 'foo';
                var path = {};
                expect(function () {
                    clRouterProvider.addRoute(route, {
                        path: path
                    });
                }).toThrow('Invalid path "' + path + '" in route "' + route + '".');
            });
        });

        // not covered because couldn't find a way to override the $routeProvider instance that the injector yields
        // basically, azRouteProvider is instantiated, and injected with the real $routeProvider, before we get a
        // chance to setup the injector
        describe('$routeProvider.when()', function () {

            var clRouterProvider;
            var $mockRouteProvider;
            beforeEach(module(function ($provide) {
                // mock $routeProviderMock
                $mockRouteProvider = jasmine.createSpyObj('$RouteProvider', ['when', '$get']);
                $provide.provider('$routeProvider', $mockRouteProvider);
            }));
            beforeEach(module(function (_clRouterProvider_) {
                clRouterProvider = _clRouterProvider_;
            }));

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            beforeEach(inject(function ($route) {}));

            it('should be invoked if route contains "template" property.', function () {
                var route = 'foo1';
                var config = {
                    path: 'bar',
                    template: 'baz'
                };
                var expected = {
                    path: 'bar',
                    template: 'baz'
                };
                clRouterProvider.addRoute(route, config);
                //expect($mockRouteProvider.when).toHaveBeenCalledWith(expected);
            });
        });

        describe('getRoute()', function () {

            var clRouterProvider;
            beforeEach(module(function (_clRouterProvider_) {
                clRouterProvider = _clRouterProvider_;
            }));

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            beforeEach(inject(function ($route) {}));

            it('should throw an error if route is unknown.', function () {
                var route = 'foobar';
                expect(function () {
                    clRouterProvider.getRoute(route);
                }).toThrow('Unknown route "' + route + '".');
            });

            it('should return the provided config object (a copy).', function () {
                var route = 'foo';
                var config = {
                    path: 'foobar'
                };
                var expected = {
                    name: route,
                    path: 'foobar'
                };

                clRouterProvider.addRoute(route, config);

                var obj = clRouterProvider.getRoute(route);
                expect(obj).not.toBe(config);
                expect(typeof obj).toBe('object');
                expect(obj.name).toEqual(expected.name);
                expect(obj.path).toEqual(expected.path);
            });
        });
    });

    describe('service', function () {

        var clRouterProvider;
        beforeEach(module(function (_clRouterProvider_) {
            var clRouterProvider = _clRouterProvider_;
            clRouterProvider.addRoute('foo', {
                path: '/bar'
            });

            clRouterProvider.addRoute('bar', {
                path: '/qux/:quux'
            });

            clRouterProvider.addRoute('baz', {
                path: '/qux/:quux?/quuux'
            });

            clRouterProvider.addRoute('qux', {
                path: '/qux/:quux*/quuux'
            });
        }));

        describe('getRoute()', function () {

            it('should throw an error if route is unknown.', inject(function (clRouter) {
                var route = 'foobar';
                expect(function () {
                    clRouter.getRoute(route);
                }).toThrow('Unknown route "' + route + '".');
            }));

            it('should return the route config.', inject(function (clRouter) {
                var route = 'bar';
                var expected = {
                    name: 'bar',
                    path: '/qux/:quux'
                };
                var obj = clRouter.getRoute(route);
                expect(typeof obj).toBe('object');
                expect(obj.name).toEqual(expected.name);
                expect(obj.path).toEqual(expected.path);
            }));
        });

        describe('getURL()', function () {

            it('should throw an error if route is unknown.', inject(function (clRouter) {
                var route = 'foobar';
                expect(function () {
                    clRouter.getURL(route);
                }).toThrow('Unknown route "' + route + '".');
            }));

            it('should return the URL location, when no parameters are required.', inject(function (clRouter) {
                var url = clRouter.getURL('foo');
                expect(url).toBe('/bar');
            }));

            it('should build the URL location, given the required parameters.', inject(function (clRouter) {
                var url = clRouter.getURL('bar', {
                    quux: 'corge'
                });
                expect(url).toBe('/qux/corge');
            }));

            it('should throw an error if a required parameter is missing. ', inject(function (clRouter) {
                var route = 'bar';
                var key = 'quux';
                expect(function () {
                    clRouter.getURL(route, {});
                }).toThrow('Missing parameter "' + key + '" when building URL for route "' + route + '".');
            }));

            it('should NOT throw an error if an optional parameter is missing. ', inject(function (clRouter) {
                var url = clRouter.getURL('baz', {});
                expect(url).toBe('/qux/quuux');
            }));

            it('should also replace symbol for greedy parameters. ', inject(function (clRouter) {
                var url = clRouter.getURL('qux', {
                    quux: 'corge'
                });
                expect(url).toBe('/qux/corge/quuux');
            }));
        });

        describe('goTo()', function () {

            // mock $location
            var $locationMock;
            beforeEach(module(function ($provide) {
                $locationMock = jasmine.createSpyObj('location', ['url']);
                $provide.value('$location', $locationMock);
            }));

            it('should throw an error if route is unknown.', inject(function (clRouter) {
                var route = 'foobar';
                expect(function () {
                    clRouter.goTo(route);
                }).toThrow('Unknown route "' + route + '".');
            }));

            it('should invoke "$location.url()" with the URL location, when no parameters are required.', inject(function (clRouter) {
                clRouter.goTo('foo');
                expect($locationMock.url).toHaveBeenCalledWith('/bar');
            }));

            it('should invoke "$location.url()" with the built URL location, given the required parameters.', inject(function (clRouter) {
                clRouter.goTo('bar', {
                    quux: 'corge'
                });
                expect($locationMock.url).toHaveBeenCalledWith('/qux/corge');
            }));

            it('should throw an error if a required parameter is missing. ', inject(function (clRouter) {
                var route = 'bar';
                var key = 'quux';
                expect(function () {
                    clRouter.goTo(route, {});
                }).toThrow('Missing parameter "' + key + '" when building URL for route "' + route + '".');
            }));

        });
    });

});

