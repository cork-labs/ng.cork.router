describe('ng.cork.router', function () {
    'use strict';

    beforeEach(module('ng.cork.router'));

    describe('provider', function () {

        var $routeProvider;
        var corkRouterProvider;
        beforeEach(module(function (_$routeProvider_, _corkRouterProvider_) {
            $routeProvider = _$routeProvider_;
            corkRouterProvider = _corkRouterProvider_;
        }));

        // kickstart the injector http://stackoverflow.com/questions/15391683/how-can-i-test-a-angularjs-provider
        beforeEach(inject(function ($route) {}));

        describe('addRoute()', function () {

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

            it('should throw an error if "params" is invalid.', function () {
                var route = 'foo';
                var params = 'bar';
                expect(function () {
                    corkRouterProvider.addRoute(route, params);
                }).toThrow(new Error('Invalid params for route "' + route + '".'));
            });

            it('should throw an error if path is missing.', function () {
                var route = 'foo';
                var path;
                expect(function () {
                    corkRouterProvider.addRoute(route, {});
                }).toThrow(new Error('Invalid path for route "' + route + '".'));
            });

            it('should throw an error if path is invalid.', function () {
                var route = 'foo';
                var path = {};
                expect(function () {
                    corkRouterProvider.addRoute(route, {
                        path: path
                    });
                }).toThrow(new Error('Invalid path for route "' + route + '".'));
            });

            it('should register the route in the $routeProvider.', function () {

                var whenSpy = spyOn($routeProvider, 'when');

                var route = 'foo';
                var params = {
                    path: '/foo',
                    controller: 'bar'
                };
                var expected = {
                    controller: 'bar',
                    name: 'foo'
                };
                corkRouterProvider.addRoute(route, params);

                expect(whenSpy).toHaveBeenCalledWith('/foo', expected);
            });
        });

        describe('addRedirect()', function () {

            it('should register the route in the $routeProvider.', function () {

                var whenSpy = spyOn($routeProvider, 'when');

                var from = '/foo';
                var to = '/bar';
                var expected = {
                    redirectTo: '/bar'
                };
                corkRouterProvider.addRedirect(from, to);
                expect(whenSpy).toHaveBeenCalledWith(from, expected);
            });
        });

        describe('$routeProvider', function () {

            it('should expose the provider.', function () {

                expect(corkRouterProvider.$routeProvider).toBe($routeProvider);
            });
        });

        describe('when()', function () {

            it('should expose the provider method.', function () {

                expect(corkRouterProvider.when).toBe($routeProvider.when);
            });
        });

        describe('otherwise', function () {

            it('should expose the provider method.', function () {

                expect(corkRouterProvider.otherwise).toBe($routeProvider.otherwise);
            });
        });

        describe('getRoute()', function () {

            it('should throw an error if route is unknown.', function () {
                var route = 'foobar';
                expect(function () {
                    corkRouterProvider.getRoute(route);
                }).toThrow(new Error('Unknown route "' + route + '".'));
            });

            it('should return the provided params object (a copy).', function () {
                var route = 'foo';
                var params = {
                    path: 'foobar',
                    controller: 'baz'
                };
                var expected = {
                    name: route,
                    path: 'foobar',
                    controller: 'baz'
                };

                corkRouterProvider.addRoute(route, params);

                var obj = corkRouterProvider.getRoute(route);
                expect(obj).not.toBe(params);
                expect(typeof obj).toBe('object');
                expect(obj.name).toEqual(expected.name);
                expect(obj.path).toEqual(expected.path);
            });
        });
    });

    describe('service', function () {

        var $routeProvider;
        var corkRouterProvider;
        beforeEach(module(function (_$routeProvider_, _corkRouterProvider_) {
            $routeProvider = _$routeProvider_;
            corkRouterProvider = _corkRouterProvider_;

            corkRouterProvider.addRoute('foo', {
                path: '/bar'
            });

            corkRouterProvider.addRoute('bar', {
                path: '/qux/:quux'
            });

            corkRouterProvider.addRoute('baz', {
                path: '/qux/:quux?/quuux'
            });

            corkRouterProvider.addRoute('bazz', {
                path: '/qux/:quux*?/quuux'
            });

            corkRouterProvider.addRoute('qux', {
                path: '/qux/:quux*/quuux'
            });
        }));

        describe('$route', function () {

            it('should expose the service.', inject(function (corkRouter, $route) {

                expect(corkRouter.$route).toBe($route);
            }));
        });

        describe('$routeParams', function () {

            it('should expose the service.', inject(function (corkRouter, $routeParams) {

                expect(corkRouter.$params).toBe($routeParams);
            }));
        });

        describe('addRoute()', function () {

            it('should expose the provider method.', inject(function (corkRouter) {

                expect(corkRouter.addRoute).toBe(corkRouterProvider.addRoute);
            }));
        });

        describe('addRedirect()', function () {

            it('should expose the provider method.', inject(function (corkRouter) {

                expect(corkRouter.addRedirect).toBe(corkRouterProvider.addRedirect);
            }));
        });

        describe('getRoute()', function () {

            it('should expose the provider method.', inject(function (corkRouter) {

                expect(corkRouter.getRoute).toBe(corkRouterProvider.getRoute);
            }));
        });

        describe('when()', function () {

            it('should expose the provider method.', inject(function (corkRouter) {

                expect(corkRouter.when).toBe($routeProvider.when);
            }));
        });

        describe('otherwise', function () {

            it('should expose the provider method.', inject(function (corkRouter) {

                expect(corkRouter.otherwise).toBe($routeProvider.otherwise);
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
                var url = corkRouter.getURL('baz');
                expect(url).toBe('/qux/quuux');
            }));

            it('should NOT throw an error if an optional parameter is missing (when parameter is greedy). ', inject(function (corkRouter) {
                var url = corkRouter.getURL('bazz');
                expect(url).toBe('/qux/quuux');
            }));

            it('should also replace symbol for greedy parameters. ', inject(function (corkRouter) {
                var url = corkRouter.getURL('qux', {
                    quux: 'corge/fox'
                });
                expect(url).toBe('/qux/corge/fox/quuux');
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
