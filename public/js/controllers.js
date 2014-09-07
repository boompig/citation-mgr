Object.prototype.toString = function() {
    var lines = [];
    for(var k in this) {
        if (this.hasOwnProperty(k)) {
            lines.push(k + ": " + this[k]);
        }
    }

    return "{\n\t" + lines.join("\t\n") + "\n}";
};

var app = angular.module("citationControllers", []);

app.controller("MainCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", function($scope, $route, $routeParams, $location, $http) {
    this.citation = {"blob": ""};

    this.submitCitation = function (e) {
        console.log("citation blob is:");
        console.log(this.citation);

        $http.post("/json", this.citation).success(function (response, statusCode) {
            console.log("Submitted to server, received response:");
            console.log(response);
        });
    };

    console.log($scope);
}]);

app.controller("NavCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", function($scope, $route, $routeParams, $location, $http) {
    this.routes = {
        "refs": "References",
        "topics": "Topics"
    };

    this.isActive = function (path) {
        return $location.path() === "/" + path;
    };
}]);

app.controller("TopicCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", function($scope, $route, $routeParams, $location, $http) {
    "use strict";

    /* data to be submitted to API endpoint */
    $scope.topicData = {name: "", description: ""}

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
                $scope.topicData = {"name": "", "description": ""};
            }
            console.log("got response:");
            console.log(response);
        });
    };

    $scope.fetchTopicList = function() {
        var that = this;

        $http.get("/topics").success(function (response, statusCode) {
            console.log("got topics:");
            console.log(response);
            $scope.topicList = response;
        });
    };

    $scope.fetchTopicList();
}]);

app.controller("RefCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", function($scope, $route, $routeParams, $location, $http) {
    /** list of topics loaded from DB */
    $scope.topicList = [];

    /** model for reference which will be added to list of references */
    $scope.ref = {
        name: null,
        first_author: null,
        year: null,
        topic: null,
    };

    $scope.submitRef = function () {
        console.log("adding ref:");
        console.log($scope.ref);

        $http.post("/refs", $scope.ref).success(function (response, statusCode) {
            if (response.status === "success") {
                console.log("yay");
            }
            console.log("got response:");
            console.log(response);
        });
    };

    $scope.fetchTopicList = function() {
        var that = this;

        $http.get("/topics").success(function (response, statusCode) {
            console.log("got topics:");
            console.log(response);
            $scope.topicList = response;
        });
    };

    $scope.fetchTopicList();
}]);
