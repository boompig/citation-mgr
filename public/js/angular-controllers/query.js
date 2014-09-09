angular.module("citationControllers")
.controller("QueryCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    /** result list fetched from server */
    $scope.resultList = [];
    /* data to send to server on query */
    $scope.queryData = {
        "username": $cookies.loginName,
        "sql": null,
        "name": null
    };
    /* last error msg */
    $scope.errorMsg = null;
    /* true on success, false on failure */
    $scope.lastResultStatus = null;
    /* list of previously executed queries */
    $scope.pastQueries = [];

    /* rerun existing query object */
    $scope.rerunQuery = function (query) {
        $scope.queryData = query;
        $scope.runQuery();
    };

    $scope.runQuery = function () {
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

                /* uniqueness checking */
                var unique = true;
                for (var i = 0; i < $scope.pastQueries.length; i++) {
                    if ($scope.pastQueries[i].name === $scope.queryData.name &&
                        $scope.pastQueries[i].sql === $scope.queryData.sql) {
                        unique = false;
                        break;
                    }
                }
                if (unique) {
                    $scope.pastQueries.push($scope.queryData);
                }

                /* clone existing object, ish */
                $scope.queryData = {
                    name: null,
                    sql: $scope.queryData.sql,
                    username: $cookies.loginName
                };
            }
        });
    };

    $scope.getResultHeadings = function () {
        return Object.keys($scope.resultList[0]).filter(function(a) {
            return a != "$$hashKey";
        });
    };
}]);
