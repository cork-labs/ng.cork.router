describe('ng.cork.router', function () {
    'use strict';

    beforeEach(module('ng.cork.router'));

    describe('provider', function () {

        describe('addRoute()', function () {

            var corkRouterProvider;
            beforeEach(module(function (_corkRouterProvider_) {
                corkRouterProvider = _corkRouterProvider_;
            }));

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            beforeEach(inject(function ($route) {}));

            it('should throw an error if name is missing.', function () {
                expect(function () {
                    corkRouterProvider.addRoute();
                }).toThrow(new Error('Invalid route name "undefined".'));
            });

            it('should throw an error if name is invalid.', function () {
                var route = {};
                expect(function () {
                    corkRouterProvider.addRoute(route);
                }).toThrow(new Error('Invalid route name "' + route + '".'));
            });

            it('should throw an error if route has a repeated name.', function () {
                var route = 'list';
                expect(function () {
                    corkRouterProvider.addRoute(route, {
                        path: '/foo'
                    });
                    corkRouterProvider.addRoute(route);
                }).toThrow(new Error('Duplicate route "' + route + '".'));
            });

            it('should throw an error if config is invalid.', function () {
                var route = 'foo';
                var config = 'bar';
                expect(function () {
                    corkRouterProvider.addRoute(route, config);
                }).toThrow(new Error('Invalid config "' + config + '" in route "' + route + '".'));
            });

            it('should throw an error if path is missing.', function () {
                var route = 'foo';
                var path;
                expect(function () {
                    corkRouterProvider.addRoute(route, {});
                }).toThrow(new Error('Invalid path "' + path + '" in route "' + route + '".'));
            });

            it('should throw an error if path is invalid.', function () {
                var route = 'foo';
                var path = {};
                expect(function () {
                    corkRouterProvider.addRoute(route, {
                        path: path
                    });
                }).toThrow(new Error('Invalid path "' + path + '" in route "' + route + '".'));
            });
        });

        // not covered because couldn't find a way to override the $routeProvider instance that the injector yields
        // basically, azRouteProvider is instantiated, and injected with the real $routeProvider, before we get a
        // chance to setup the injector
        describe('$routeProvider.when()', function () {

            var corkRouterProvider;
            var $mockRouteProvider;
            beforeEach(module(function ($provide) {
                // mock $routeProviderMock
                $mockRouteProvider = jasmine.createSpyObj('$RouteProvider', ['when', '$get']);
                $provide.provider('$routeProvider', $mockRouteProvider);
            }));
            beforeEach(module(function (_corkRouterProvider_) {
                corkRouterProvider = _corkRouterProvider_;
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
                corkRouterProvider.addRoute(route, config);
                //expect($mockRouteProvider.when).toHaveBeenCalledWith(expected);
            });
        });

        describe('getRoute()', function () {

            var corkRouterProvider;
            beforeEach(module(function (_corkRouterProvider_) {
                corkRouterProvider = _corkRouterProvider_;
            }));

            // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
            beforeEach(inject(function ($route) {}));

            it('should throw an error if route is unknown.', function () {
                var route = 'foobar';
                expect(function () {
                    corkRouterProvider.getRoute(route);
                }).toThrow(new Error('Unknown route "' + route + '".'));
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

                corkRouterProvider.addRoute(route, config);

                var obj = corkRouterProvider.getRoute(route);
                expect(obj).not.toBe(config);
                expect(typeof obj).toBe('object');
                expect(obj.name).toEqual(expected.name);
                expect(obj.path).toEqual(expected.path);
            });
        });
    });

    describe('service', function () {

        var corkRouterProvider;
        beforeEach(module(function (_corkRouterProvider_) {
            var corkRouterProvider = _corkRouterProvider_;
            corkRouterProvider.addRoute('foo', {
                path: '/bar'
            });

            corkRouterProvider.addRoute('bar', {
                path: '/qux/:quux'
            });

            corkRouterProvider.addRoute('baz', {
                path: '/qux/:quux?/quuux'
            });

            corkRouterProvider.addRoute('qux', {
                path: '/qux/:quux*/quuux'
            });
        }));

        describe('getRoute()', function () {

            it('should throw an error if route is unknown.', inject(function (corkRouter) {
                var route = 'foobar';
                expect(function () {
                    corkRouter.getRoute(route);
                }).toThrow(new Error('Unknown route "' + route + '".'));
            }));

            it('should return the route config.', inject(function (corkRouter) {
                var route = 'bar';
                var expected = {
                    name: 'bar',
                    path: '/qux/:quux'
                };
                var obj = corkRouter.getRoute(route);
                expect(typeof obj).toBe('object');
                expect(obj.name).toEqual(expected.name);
                expect(obj.path).toEqual(expected.path);
            }));
        });

        describe('getURL()', function () {

            it('should throw an error if route is unknown.', inject(function (corkRouter) {
                var route = 'foobar';
                expect(function () {
                    corkRouter.getURL(route);
                }).toThrow(new Error('Unknown route "' + route + '".'));
            }));

            it('should return the URL location, when no parameters are required.', inject(function (corkRouter) {
                var url = corkRouter.getURL('foo');
                expect(url).toBe('/bar');
            }));

            it('should build the URL location, given the required parameters.', inject(function (corkRouter) {
                var url = corkRouter.getURL('bar', {
                    quux: 'corge'
                });
                expect(url).toBe('/qux/corge');
            }));

            it('should throw an error if a required parameter is missing. ', inject(function (corkRouter) {
                var route = 'bar';
                var key = 'quux';
                expect(function () {
                    corkRouter.getURL(route, {});
                }).toThrow(new Error('Missing parameter "' + key + '" when building URL for route "' + route + '".'));
            }));

            it('should NOT throw an error if an optional parameter is missing. ', inject(function (corkRouter) {
                var url = corkRouter.getURL('baz', {});
                expect(url).toBe('/qux/quuux');
            }));

            it('should also replace symbol for greedy parameters. ', inject(function (corkRouter) {
                var url = corkRouter.getURL('qux', {
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

            it('should throw an error if route is unknown.', inject(function (corkRouter) {
                var route = 'foobar';
                expect(function () {
                    corkRouter.goTo(route);
                }).toThrow(new Error('Unknown route "' + route + '".'));
            }));

            it('should invoke "$location.url()" with the URL location, when no parameters are required.', inject(function (corkRouter) {
                corkRouter.goTo('foo');
                expect($locationMock.url).toHaveBeenCalledWith('/bar');
            }));

            it('should invoke "$location.url()" with the built URL location, given the required parameters.', inject(function (corkRouter) {
                corkRouter.goTo('bar', {
                    quux: 'corge'
                });
                expect($locationMock.url).toHaveBeenCalledWith('/qux/corge');
            }));

            it('should throw an error if a required parameter is missing. ', inject(function (corkRouter) {
                var route = 'bar';
                var key = 'quux';
                expect(function () {
                    corkRouter.goTo(route, {});
                }).toThrow(new Error('Missing parameter "' + key + '" when building URL for route "' + route + '".'));
            }));

        });
    });

});
