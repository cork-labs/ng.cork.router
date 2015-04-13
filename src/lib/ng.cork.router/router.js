(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.router', [
        'ngRoute'
    ]);

    var copy = angular.copy;
    var isString = angular.isString;

    /**
     * @ngdoc object
     * @name ng.cork.router.corkRouterProvider
     *
     * @dependencies
     * - ngRoute
     *
     * @description
     * Allows the {@link ng.cork.router.corkRouter corkRouter} service to be configured and routes to be registered in `$routeProvider` during the config phase of the application.
     * config phase of your application.
     *
     * @property {Object} $routeProvider Reference to [$routeProvider](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider) provider. No need to inject both `corkRouterProvider` and `$routeProvider` in case you need some underlying feature, such as `$route.current`.
     */
    module.provider('corkRouter', [
        '$routeProvider',
        function corkRouterProvider($routeProvider) {

            /**
             * stores unique route objects
             */
            var routeMap = {};

            /**
             * Adds a route with $routeProvider and registers the route in the map.
             * @param {string} name  The route name.
             * @param {object} params The $routeProvider object, extended with a `path` attribute.
             */
            var addRoute = function (name, params) {

                if (!isString(name) || !name.length) {
                    throw new Error('Invalid route name "' + name + '".');
                }

                if (routeMap[name]) {
                    throw new Error('Duplicate route "' + name + '".');
                }

                if (!angular.isObject(params)) {
                    throw new Error('Invalid params for route "' + name + '".');
                }

                var path = params.path;
                if (!isString(path) || !path.length) {
                    throw new Error('Invalid path for route "' + name + '".');
                }

                params.name = name;
                routeMap[name] = angular.copy(params);

                // register the route
                if (params.controller || params.template || params.templateUrl) {
                    params = angular.copy(params);
                    delete params.path;
                    $routeProvider.when(path, params);
                }
            };

            /**
             * Registers a _redirect_ route in angular `$routeProvider`.
             * @param {string} from The path to be redirected.
             * @param {string} to The path to redirect to.
             */
            var addRedirect = function (from, to) {
                $routeProvider.when(from, {
                    redirectTo: to
                });
            };

            /**
             * Returns the route configuration.
             * @param {string}  name  The route name.
             * @param {object=} params The route params.
             */
            var getRoute = function (name) {
                if (!routeMap.hasOwnProperty(name)) {
                    throw new Error('Unknown route "' + name + '".');
                }
                return routeMap[name];
            };

            /**
             * Builds the url with the provided parameters.
             * @param {string}  name
             * @param {object=} params
             * @returns {string}
             */
            var getURL = function (name, params) {

                var url = getRoute(name).path;
                var hasParam;
                var isOptional;
                var isGreedy;
                var regexp;
                var replace;
                params = params || {};

                url = url.replace(/(\/)?:(\w+)([\?\*]{1,2})?/g, function (result, slash, key, flags) {
                    hasParam = params.hasOwnProperty(key);
                    isOptional = flags && flags.indexOf('?') !== -1;
                    isGreedy = flags && flags.indexOf('*') !== -1;
                    console.log(url, flags, isOptional, isGreedy);
                    // error on mandatory parameters
                    if (!isOptional && !hasParam) {
                        throw new Error('Missing parameter "' + key + '" when building URL for route "' + name + '".');
                    }
                    regexp = ':' + key;
                    // greedy parameters
                    if (isGreedy) {
                        regexp += '\\*';
                    }
                    // optional parameters
                    if (isOptional) {
                        regexp += '\\?';
                        // replace preceeding / if optional parameter is not provided
                        if (!hasParam || !params[key]) {
                            regexp = '\/' + regexp;
                        }
                    }
                    replace = (hasParam && params[key]) || '';
                    return result.replace(new RegExp(regexp), replace);
                });

                return url;
            };

            /**
             * @ngdoc method
             * @name addRoute
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Registers the route in both angular `$routeProvider` and the {@link ng.cork.router.corkRouterProvider corkRouterProvider} provider.
             *
             * @param {string} name  The route name.
             * @param {object} params The underlying [$routeProvider.when](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider.when) `route` and `path` arguments in a single object.
             *
             * Ex:
             * ```
             * {
             *     path: '/foo/bar',
             *     controller: 'myController',
             *     templateUrl: 'my.tpl.html'
             * }
             * ```
             */
            this.addRoute = addRoute;

            /**
             * @ngdoc method
             * @name addRedirect
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Registers a _redirect_ route in angular `$routeProvider`.
             *
             * @param {string} from The path to be redirected.
             * @param {string} to The path to redirect to.
             */
            this.addRedirect = addRedirect;

            /**
             * @ngdoc method
             * @name when
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Reference to [$routeProvider.when()](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider.when).
             *
             * @param {string} path Route path (matched against $location.path).
             * @param {object} route Mapping information to be assigned to $route.current on route match.
             */
            this.when = $routeProvider.when;

            /**
             * @ngdoc method
             * @name otherwise
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Reference to [$routeProvider.otherwise()](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#otherwise $routeProvider.otherwise).
             *
             * @param {object} params Mapping information to be assigned to $route.current. If called with a string, the value maps to redirectTo.
             */
            this.otherwise = $routeProvider.otherwise;

            /**
             * @ngdoc method
             * @name getRoute
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  name The name of the route.
             *
             * @returns {object} The requested route object.
             */
            this.getRoute = getRoute;

            /**
             * @ngdoc method
             * @name getRoute
             * @methodOf ng.cork.router.corkRouterProvider
             *
             * @description
             * Returns the route configuration.
             *
             * @param {string}  name  The name of the route.
             * @param {object=} params The route params. Must include vaues for all mandatory `:params`.
             *
             * @returns {string} The route path interpolated with the provided param values.
             */
            this.getURL = getURL;

            this.$routeProvider = $routeProvider;

            /**
             * @ngdoc service
             * @name ng.cork.router.corkRouter
             *
             * @description
             * Provides methods to build and retrieive route paths and a navigation helper to trigger route changes by name.
             *
             * @property {Object} $route  Reference to [$route](https://docs.angularjs.org/api/ngRoute/service/$route) service. No need to inject both `corkRouter` and `$route` in case you need some underlying feature, such as `$route.current`.
             * @property {Object} $params Reference to [$routeParams](https://docs.angularjs.org/api/ngRoute/service/$routeParams) service. No need to inject both `corkRouter` and `$routeParams`.
             */
            this.$get = [
                '$route',
                '$routeParams',
                '$location',
                function corkRouter($route, $routeParams, $location) {

                    var serviceApi = {

                        /**
                         * @ngdoc method
                         * @name addRoute
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Registers the route in both angular `$routeProvider` and the {@link corkRouterProvider} provider.
                         *
                         * @param {string} name  The name of the route.
                         * @param {object} config The underlying [$routeProvider.when](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider.when) `route` and `path` arguments in a single object.
                         *
                         * Ex:
                         * ```
                         * {
                         *     path: '/foo/bar',
                         *     controller: 'myController',
                         *     templateUrl: 'my.tpl.html'
                         * }
                         * ```
                         */
                        addRoute: addRoute,

                        /**
                         * @ngdoc method
                         * @name addRedirect
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Registers a _redirect_ route in angular `$routeProvider`.
                         *
                         * @param {string} from The path to be redirected.
                         * @param {string} to The path to redirect to.
                         */
                        addRedirect: addRedirect,

                        /**
                         * @ngdoc method
                         * @name when
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Reference to [$routeProvider.when()](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when $routeProvider.when).
                         *
                         * @param {string} path Route path (matched against $location.path).
                         * @param {object} route Mapping information to be assigned to $route.current on route match.
                         */
                        when: $routeProvider.when,

                        /**
                         * @ngdoc method
                         * @name otherwise
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Reference to [$routeProvider.otherwise()](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#otherwise $routeProvider.otherwise).
                         *
                         * @param {object} params Mapping information to be assigned to $route.current. If called with a string, the value maps to redirectTo.
                         */
                        otherwise: $routeProvider.otherwise,

                        /**
                         * @ngdoc method
                         * @name getRoute
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Returns the route configuration.
                         *
                         * @param {string} name The name of the route.
                         *
                         * @returns {object} The requested route object.
                         */
                        getRoute: getRoute,

                        /**
                         * @ngdoc method
                         * @name getURL
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Builds the URL for a route, given the provided params.
                         *
                         * @param {string}  name  The name of the route.
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
                         * @methodOf ng.cork.router.corkRouter
                         *
                         * @description
                         * Navigates to a route, given the provided params and
                         *
                         * @param {string}  name  The name of the route.
                         * @param {object=} params The route params. Must include vaues for all mandatory `:params`.
                         */
                        goTo: function (name, params) {
                            return $location.url(getURL(name, params));
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
