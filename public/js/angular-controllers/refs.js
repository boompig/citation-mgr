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

    /* list of references loaded from DB */
    $scope.refList = [];

    $scope.submitRef = function () {
        console.log("adding ref:");
        console.log($scope.ref);

        $http.post("/refs", $scope.ref).success(function (response, statusCode) {
            console.log("got response:");
            console.log(response);
            if (response.status === "success") {
                $scope.refList.push($scope.ref);

                // reset ref
                $scope.ref = {
                    name: null,
                    first_author: null,
                    year: null,
                    topic: null,
                    username: $cookies.loginName
                };
            }
        });
    };

    $scope.deleteRef = function (refItem) {
        $http.delete("/refs/" + refItem.id).success(function(response, statusCode) {
            console.log("response:");
            console.log(response);

            if (response.status === "success") {
                // remove from refList on success
                var i = $scope.refList.indexOf(refItem);
                if (i >= 0) {
                    $scope.refList.splice(i, 1);
                }
            }
        });
    };

    $scope.getRefList = function() {
        $http.get("/refs", {username: $cookies.loginName}).success(function(response, statusCode) {
            console.log("refs:");
            console.log(response);
            $scope.refList = response;
        });
    };

    $scope.getTopicList = function() {
        var that = this;

        $http.get("/topics?username=" + $cookies.loginName).success(function (response, statusCode) {
            console.log("got topics:");
            console.log(response);
            $scope.topicList = response;
        });
    };

    $scope.getTopicList();
    $scope.getRefList();
}]);
