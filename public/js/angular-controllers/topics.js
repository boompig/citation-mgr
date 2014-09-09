angular.module("citationControllers")
.controller("TopicCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    /* data to be submitted to API endpoint */
    $scope.topicData = {name: "", description: "", "username": $cookies.loginName}

    /* data received from API endpoint */
    $scope.topicList = [];

    /* true on success, false on failure */
    $scope.lastStatus = null;
    /* displayed when lastStatus not null, only displays on INSERT */
    $scope.statusMsg = null;

    $scope.removeTopic = function (topicItem) {
        console.log("removing topic:");
        console.log(topicItem);
        $scope.lastStatus = null;

        $http.delete("/topics/" + topicItem.id).success(function (response, statusCode) {
            console.log("got response:");
            console.log(response);

            if (response.status === "success") {
                // do not remove until success is returned
                var i = $scope.topicList.indexOf(topicItem);
                if (i >= 0) {
                    $scope.topicList.splice(i, 1);
                }
                console.log("successfully removed");
            }
        });
    };

    $scope.submitTopic = function (e) {
        console.log("adding topic:");
        console.log($scope.topicData);

        $http.post("/topics", $scope.topicData).success(function (response, statusCode) {
            console.log("got response:");
            console.log(response);

            $scope.lastStatus = (response.status === "success");

            if (response.status === "success") {
                // insert ID is returned in response
                $scope.topicData.id = response.insert_id;
                $scope.topicList.push($scope.topicData);
                $scope.topicData = {name: null, description: null, username: $cookies.loginName};

                $scope.statusMsg = "Successfully created topic";
            } else {
                $scope.statusMsg = response.msg;
            }
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
