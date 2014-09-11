angular.module("citationControllers")
.controller("LocationCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", "$modal", function($scope, $route, $routeParams, $location, $http, $cookies, $modal) {
    "use strict";

    $scope.username = $cookies.loginName;

    $scope.locationList = [];
    $scope.refList = [];
    $scope.topicList = [];
    $scope.bowList = [];
    $scope.sectionList = [];
    /* map of topic IDs to topic objects */
    $scope.topics = {};

    $scope.openModal = function () {
        $modal.open({
            templateUrl: "locationModalContent.html",
            controller: "LocationCtrl" // myself
        });
    };

    $scope.locationData = {
        ref: "",
        ref_quote: null,
        quote: null,
        section: "",
        username: $scope.username,
        topic: "",
        body_of_work: ""
    };

    $scope.submitRefLocation = function (e) {
        console.log("submitting ref location:");
        console.log($scope.locationData);

        if ($scope.locationData.ref === "") {
            $scope.locationData.ref = null;
        }
        if ($scope.locationData.section === "") {
            $scope.locationData.section = null;
        }
        if ($scope.locationData.topic === "") {
            $scope.locationData.topic = null;
        }
        if ($scope.locationData.body_of_work === "") {
            $scope.locationData.body_of_work = null;
        }

        $http.post("/locations", $scope.locationData).success(function(response) {
            console.log("response:");
            console.log(response);

            // update ID
            if (response.status === "success") {
                // reload, as it solves lots of problems
                window.location.reload();
            }
        });
    };

    $scope.deleteLocation = function (locationItem) {
        console.log("deleting location:");
        console.log(locationItem);

        $http.delete("/locations/" + locationItem.id).success(function(response) {
            console.log("response:");
            console.log(response);

            var i = $scope.locationList.indexOf(locationItem);
            if (i >= 0) {
                $scope.locationList.splice(i, 1);
            }
        });
    };

    $scope.getLocations = function () {
        $http.get("/locations?username=" + $scope.username).success(function(response){
            console.log("locations:");
            console.log(response);
            $scope.locationList = response;
        });
    };

    $scope.getRefs = function () {
        $http.get("/refs?username=" + $scope.username).success(function(response){
            console.log("refs:");
            console.log(response);
            $scope.refList = response;
        });
    };

    $scope.getSections = function () {
        $http.get("/sections?username=" + $scope.username).success(function(response, statusCode){
            console.log("sections:");
            console.log(response);
            $scope.sectionList = response;
        });
    };

    $scope.getTopic = function (topicID) {
        if ($scope.topics.hasOwnProperty(topicID)) {
            return $scope.topics[topicID].name;
        } else {
            return null;
        }
    };

    $scope.getTopics = function () {
        $http.get("/topics?username=" + $scope.username).success(function(response, statusCode){
            console.log("topics:");
            // response is a list of topic objects in no particular order
            console.log(response);
            $scope.topicList = response;

            // index topics by ID
            for (var i = 0; i < response.length; i++) {
                $scope.topics[response[i].id] = response[i];
            }
        });
    };

    $scope.getBodiesOfWork = function () {
        $http.get("/bow?username=" + $scope.username).success(function(response){
            console.log("bow:");
            // response is a list of topic objects in no particular order
            console.log(response);
            $scope.bowList = response;
        });
    };

    $scope.getLocations();
    $scope.getTopics();
    $scope.getRefs();
    $scope.getSections();
    $scope.getBodiesOfWork();
}]);
