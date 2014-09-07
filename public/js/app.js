angular.module("App", ["ngRoute", "citationControllers"])
.config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
    "use strict";

    $routeProvider
    .when("/", {
        templateUrl: "views/main.html",
        controller: "MainCtrl",
        controllerAs: "m"
    })
    .when("/topics", {
        templateUrl: "views/topics.html",
        controller: "TopicCtrl",
        controllerAs: "t"
    })
    .when("/refs", {
        templateUrl: "views/refs.html",
        controller: "RefCtrl",
        controllerAs: "r"
    });
}]);
