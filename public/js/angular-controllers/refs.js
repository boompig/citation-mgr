angular.module("citationControllers")
.controller("RefCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    /** list of topics loaded from DB */
    $scope.topicList = [];

    /** model for reference which will be added to list of references */
    $scope.ref = {
        name: null,
        first_author: null,
        year: null,
        topic: null,
        username: $cookies.loginName
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

        $http.get("/topics?username=" + $cookies.loginName).success(function (response, statusCode) {
            console.log("got topics:");
            console.log(response);
            $scope.topicList = response;
        });
    };

    $scope.fetchTopicList();
}]);
