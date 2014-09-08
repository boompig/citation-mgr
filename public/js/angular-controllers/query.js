angular.module("citationControllers")
.controller("QueryCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    $scope.resultList = [];
    $scope.queryData = {
        "username": $cookies.loginName,
        "sql": null
    };

    $scope.errorMsg = null;

    $scope.runQuery = function (e) {
        console.log("Running query");
        console.log($scope.queryData);
        $http.post("/sql", $scope.queryData).success(function(response, statusCode) {
            console.log("result:");
            console.log(response);
            if (response.hasOwnProperty("status") && response.status === "error") {
                $scope.resultList = [];
                $scope.errorMsg = response.msg;
            } else {
                $scope.resultList = response;
                $scope.errorMsg = null;
            }
        });
    };

    $scope.getResultHeadings = function () {
        return Object.keys($scope.resultList[0]).filter(function(a) {
            return a != "$$hashKey";
        });
    };
}]);
