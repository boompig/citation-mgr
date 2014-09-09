angular.module("citationControllers")
.controller("LocationCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    $scope.username = $cookies.loginName;

    $scope.locationList = [];
    /* map of topic IDs to topic objects */
    $scope.topics = {};

    $scope.getLocations = function () {
        $http.get("/locations", {username: $scope.username}).success(function(response, statusCode){
            console.log("locations:");
            console.log(response);
            $scope.locationList = response;
        });
    };

    $scope.getTopic = function (topicID) {
        if (Object.keys($scope.topics) === []) {
            return null;
        } else {
            return $scope.topics[topicID].name;
        }
    };

    $scope.getTopics = function () {
        $http.get("/topics", {username: $scope.username}).success(function(response, statusCode){
            console.log("topics:");
            // response is a list of topic objects in no particular order
            console.log(response);

            // index topics by ID
            for (var i = 0; i < response.length; i++) {
                $scope.topics[response[i].id] = response[i];
            }
        });
    };

    $scope.getLocations();
    $scope.getTopics();
}]);
