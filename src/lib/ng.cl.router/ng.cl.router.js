(function (angular) {
    'use strict';

    var module = angular.module('ng.cl.router', [
        'ngRoute'
    ]);

    /**
     * @ngdoc object
     * @name clRouterProvider
     *
     * @description
     * Allows the {@link clRouter} service to be configured.
     */
    module.provider('clRouter', [
        '$routeProvider',
        function clRouterProvider($routeProvider) {

            /**
             * stores unique route objects
             */
            var routeMap = {};

            /**
             * Adds a route with $routeProvider and registers the route in the map.
             * @param {string} route  The route name.
             * @param {object} config The $routeProvider object, extended with `pattern` and optional `link`.
             */
            var addRoute = function (route, config) {

                if (!angular.isString(route) || !route.length) {
                    throw new Error('Invalid route name "' + route + '".');
                }

                if (routeMap[route]) {
                    throw new Error('Duplicate route "' + route + '".');
                }

                if (!angular.isObject(config)) {
                    throw new Error('Invalid config "' + config + '" in route "' + route + '".');
                }

                var options = angular.copy(config);

                if (!angular.isString(options.pattern) || !options.pattern.length) {
                    throw new Error('Invalid pattern "' + options.pattern + '" in route "' + route + '".');
                }

                // add name and location
                options.name = route;

                routeMap[route] = options;

                // register the route
                if (options.template || options.templateUrl || options.controller) {
                    $routeProvider.when(options.pattern, options);
                }
            };

            /**
             * Returns the route configuration.
             * @param {string}  route  The route name.
             * @param {object=} params The route params.
             */
            var getRoute = function (route) {
                if (!routeMap.hasOwnProperty(route)) {
                    throw new Error('Unknown route "' + route + '".');
                }
                return routeMap[route];
            };

            /**
             * Parser for the url, it builds the url with the parameters provided
             * @param {string}  route
             * @param {object=} params
             */
            var getURL = function (route, params) {

                var url = getRoute(route).pattern;
                var hasParam;
                var regexp;
                var replace;

                url = url.replace(/(\/)?:(\w+)(\?|\*)?/g, function (result, slash, key, flag) {
                    hasParam = params.hasOwnProperty(key);
                    // error on mandatory parameters
                    if (flag !== '?' && !hasParam) {
                        throw new Error('Missing parameter "' + key + '" when building URL for route "' + route + '".');
                    }
                    regexp = ':' + key;
                    // optional parameters
                    if (flag === '?') {
                        regexp += '\\?';
                        // replace preceeding / if optional parameter is not provided
                        if (!hasParam || !params[key]) {
                            regexp = '\/' + regexp;
                        }
                    }
                    // greedy parameters
                    else if (flag === '*') {
                        regexp += '\\*';
                    }
                    replace = (hasParam && params[key]) || '';
                    return result.replace(new RegExp(regexp), replace);
                });

                return url;
            };

            /**
             * @ngdoc method
             * @name clRouterProvider#addRoute
             *
             * @description
             * Registers the route in both angular `$routeProvider` and the {@link clRouterProvider} provider.
             *
             * @param {string} route  The route name.
             * @param {object} config The $routeProvider object, extended with `pattern` and optional `link`.
             */
            this.addRoute = addRoute;

            /**
             * @ngdoc method
             * @name clRouterProvider#getRoute
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  route  The name of the route.
             */
            this.getRoute = getRoute;

            /**
             * @ngdoc method
             * @name clRouterProvider#getRoute
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  route  The name of the route.
             * @param {object=} params The route params.
             */
            this.getURL = getURL;

            /**
             * @ngdoc service
             * @name clRouter
             *
             * @description
             * Provides methods to build route URLs and navigation helpers.
             */
            this.$get = [
                '$route',
                '$location',
                function clRouterFactory($route, $location) {

                    /**
                     * parses
                     */
                    var parser = document.createElement('a');

                    var api = {

                        /**
                         * @ngdoc method
                         * @name clRouter#addRoute
                         *
                         * @description
                         * Registers the route in both angular `$routeProvider` and the {@link clRouterProvider} provider.
                         *
                         * @param {string}  route  The route name.
                         * @param {object=} params The route params.
                         */
                        addRoute: addRoute,

                        /**
                         * @ngdoc method
                         * @name clRouter#getRoute
                         *
                         * @description
                         * Returns the route configuration.
                         *
                         * @param {string}  route  The route name.
                         */
                        getRoute: getRoute,

                        /**
                         * @ngdoc method
                         * @name clRouter#getURL
                         *
                         * @description
                         * Builds the URL for a route, given the provided params.
                         *
                         * @param {string}  route  The name of the route.
                         * @param {object=} params The route params.
                         */
                        getURL: function (route, params) {
                            return getURL(route, params);
                        },

                        /**
                         * @ngdoc method
                         * @name clRouter#gotoRoute
                         *
                         * @description
                         * Navigates to a route, given the provided params and
                         *
                         * @param {string}  route  The name of the route.
                         * @param {object=} params The route params.
                         */
                        gotoRoute: function (route, params) {
                            return $location.url(getURL(route, params));
                        }
                    };

                    Object.defineProperty(api, '$route', {
                        get: function () {
                            return $route;
                        }
                    });

                    return api;
                }
            ];

        }
    ]);

})(angular);

