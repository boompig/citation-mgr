angular.module("citationControllers")
.controller("TopicCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    /* data to be submitted to API endpoint */
    $scope.topicData = {name: "", description: "", "username": $cookies.loginName}

    /* data received from API endpoint */
    $scope.topicList = [];

    $scope.removeTopic = function (topicItem) {
        console.log("removing topic:");
        var i = $scope.topicList.indexOf(topicItem);
        $scope.topicList.splice(i, 1);
        console.log(topicItem);

        $http.delete("/topics/" + topicItem.id).success(function (response, statusCode) {
            console.log("got response:");
            console.log(response);
            if (response.status === "success") {
                console.log("successfully removed");
            }
        });
    };

    $scope.submitTopic = function (e) {
        console.log("adding topic:");
        console.log($scope.topicData);

        $http.post("/topics", $scope.topicData).success(function (response, statusCode) {
            if (response.status === "success") {
                $scope.topicList.push($scope.topicData);
                $scope.topicData = {name: null, description: null, username: $cookies.loginName};
            }
            console.log("got response:");
            console.log(response);
        });
    };

    $scope.fetchTopicList = function() {
        var that = this;

        $http.get("/topics?username=" + $cookies.loginName).success(function (response, statusCode) {
            console.log("got topics:");
            console.log(response);
            $scope.topicList = response;
        });
    };

    $scope.fetchTopicList();
}]);
