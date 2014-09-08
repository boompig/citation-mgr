angular.module("citationControllers")
.controller("QueryCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    /** result list fetched from server */
    $scope.resultList = [];
    /* data to send to server on query */
    $scope.queryData = {
        "username": $cookies.loginName,
        "sql": null
    };
    /* last error msg */
    $scope.errorMsg = null;
    /* true on success, false on failure */
    $scope.lastResultStatus = null;

    $scope.runQuery = function (e) {
        console.log("Running query");
        console.log($scope.queryData);
        $http.post("/sql", $scope.queryData).success(function(response, statusCode) {
            console.log("result:");
            console.log(response);
            if (response.hasOwnProperty("status") && response.status === "error") {
                $scope.resultList = [];
                $scope.errorMsg = response.msg;
                $scope.lastResultStatus = false;
            } else {
                $scope.resultList = response;
                $scope.errorMsg = null;
                $scope.lastResultStatus = true;
            }
        });
    };

    $scope.getResultHeadings = function () {
        return Object.keys($scope.resultList[0]).filter(function(a) {
            return a != "$$hashKey";
        });
    };
}]);
