angular.module("App", ["ngRoute", "ngCookies", "citationControllers"])
.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    "use strict";

    $routeProvider
    .when("/", {
        templateUrl: "views/main.html",
        controller: "LoginCtrl",
        controllerAs: "l"
    })
    .when("/sections", {
        templateUrl: "views/sections.html",
        controller: "SectionCtrl",
        controllerAs: "sec"
    })
    .when("/topics", {
        templateUrl: "views/topics.html",
        controller: "TopicCtrl",
        controllerAs: "t"
    })
    .when("/locations", {
        templateUrl: "views/locations.html",
        controller: "LocationCtrl",
        controllerAs: "loc"
    })
    .when("/refs", {
        templateUrl: "views/refs.html",
        controller: "RefCtrl",
        controllerAs: "r"
    });
}]);
