angular.module("citationControllers")
.controller("NavCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    this.loginName = null;

    this.routes = {
        "refs": "References",
        "topics": "Topics",
        "sections": "Thesis Sections",
        "locations": "Reference Locations"
    };

    this.getLoginName = function () {
        this.loginName = $cookies.loginName;
        return this.loginName;
    };

    this.isActive = function (path) {
        return $location.path() === "/" + path;
    };
}]);
