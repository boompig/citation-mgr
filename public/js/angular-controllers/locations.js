angular.module("citationControllers")
.controller("LocationCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    $scope.username = $cookies.loginName;

    $scope.locationList = [];

    $scope.getLocations = function () {
        $http.get("/locations?username=" + $scope.username).success(function(response, statusCode){
            console.log("locations:");
            console.log(response);
            $scope.locationList = response;
        });
    };

    $scope.getLocations();
}]);
