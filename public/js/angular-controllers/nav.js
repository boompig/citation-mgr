/* global angular */
/* env browser */

angular.module("citationControllers")
    .controller("NavCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
        this.loginName = null;

        this.routes = [
            {"link": "refs", "name": "References"},
            {"link": "topics", "name": "Topics"},
            {"link": "sections", "name": "Thesis Sections"},
            {"link": "locations", "name": "Notes"},
            {"link": "sql", "name": "SQL"}
        ];

        this.getLoginName = function () {
            this.loginName = $cookies.loginName;
            return this.loginName;
        };

        this.isActive = function (path) {
            return $location.path() === "/" + path;
        };
    }]);
