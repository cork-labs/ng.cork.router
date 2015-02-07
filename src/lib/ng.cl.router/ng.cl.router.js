(function (angular) {
    'use strict';

    var module = angular.module('ng.cl.router', [
        'ngRoute'
    ]);

    /**
     * @ngdoc object
     * @name ng.cl.router.clRouterProvider
     *
     * @dependencies
     * - ngRoute
     *
     * @description
     * Allows the {@link clRouter} service to be configured and routes to be registered in `$routeProvider` during the
     * config phase of your application.
     *
     * @property {Object} $routeProvider Reference to AngularJS `$routeProvider` provider. Avoids having to inject both `clRouterProvider` and `$routeProvider` in case you need some underlying feature like `$route.current`.
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
             * @param {object} config The $routeProvider object, extended with a `path` attribute.
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

                if (!angular.isString(options.path) || !options.path.length) {
                    throw new Error('Invalid path "' + options.path + '" in route "' + route + '".');
                }

                // add name and location
                options.name = route;

                routeMap[route] = options;

                // register the route
                if (options.controller || options.template || options.templateUrl) {
                    $routeProvider.when(options.path, options);
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
             * Builds the url with the provided parameters.
             * @param {string}  route
             * @param {object=} params
             * @returns {string}
             */
            var getURL = function (route, params) {

                var url = getRoute(route).path;
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
             * @name addRoute
             * @methodOf ng.cl.router.clRouterProvider
             *
             * @description
             * Registers the route in both angular `$routeProvider` and the {@link clRouterProvider} provider.
             *
             * @param {string} route  The route name.
             * @param {object} config The $routeProvider object, extended with a `path` attribute that corresponds to the `path` argument to {@link https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider:when()}.
             */
            this.addRoute = addRoute;

            /**
             * @ngdoc method
             * @name getRoute
             * @methodOf ng.cl.router.clRouterProvider
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  route The name of the route.
             *
             * @returns {object} The requested route object.
             */
            this.getRoute = getRoute;

            /**
             * @ngdoc method
             * @name getRoute
             * @methodOf ng.cl.router.clRouterProvider
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  route  The name of the route.
             * @param {object=} params The route params. Must include vaues for all mandatory `:params`.
             *
             * @returns {string} The route path interpolated with the provided param values.
             */
            this.getURL = getURL;

            this.$routeProvider = $routeProvider;

            /**
             * @ngdoc service
             * @name ng.cl.router.clRouter
             *
             * @description
             * Provides methods to build and retrieive route paths and a navigation helper to trigger route changes by name.
             *
             * @property {Object} $route  Reference to AngularJS `$route` service. Avoids having to inject both `clRouter` and `$route` in case you need some underlying feature like `$route.current`.
             * @property {Object} $params Reference to AngularJS `$routeParams` service. Avoids having to inject both `clRouter` and `$routeParams`.
             */
            this.$get = [
                '$route',
                '$routeParams',
                '$location',
                function clRouter($route, $routeParams, $location) {

                    var serviceApi = {

                        /**
                         * @ngdoc method
                         * @name addRoute
                         * @methodOf ng.cl.router.clRouter
                         *
                         * @description
                         * Registers the route in both angular `$routeProvider` and the {@link clRouterProvider} provider.
                         *
                         * @param {string}  route  The name of the route.
                         * @param {object} config The $routeProvider object, extended with a `path` attribute that corresponds to the `path` argument to {@link https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider:when()}.
                         */
                        addRoute: addRoute,

                        /**
                         * @ngdoc method
                         * @name getRoute
                         * @methodOf ng.cl.router.clRouter
                         *
                         * @description
                         * Returns the route configuration.
                         *
                         * @param {string} route The name of the route.
                         *
                         * @returns {object} The requested route object.
                         */
                        getRoute: getRoute,

                        /**
                         * @ngdoc method
                         * @name getURL
                         * @methodOf ng.cl.router.clRouter
                         *
                         * @description
                         * Builds the URL for a route, given the provided params.
                         *
                         * @param {string}  route  The name of the route.
                         * @param {object=} params The route params. Must include vaues for all mandatory `:params`.
                         *
                         * @returns {string} The route path interpolated with the provided param values.
                         */
                        getURL: function (route, params) {
                            return getURL(route, params);
                        },

                        /**
                         * @ngdoc method
                         * @name goTo
                         * @methodOf ng.cl.router.clRouter
                         *
                         * @description
                         * Navigates to a route, given the provided params and
                         *
                         * @param {string}  route  The name of the route.
                         * @param {object=} params The route params. Must include vaues for all mandatory `:params`.
                         */
                        goTo: function (route, params) {
                            return $location.url(getURL(route, params));
                        }
                    };

                    serviceApi.$route = $route;

                    serviceApi.$params = $routeParams;

                    return serviceApi;
                }
            ];

        }
    ]);

})(angular);

