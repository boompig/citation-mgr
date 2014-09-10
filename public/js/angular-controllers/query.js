angular.module("citationControllers")
.controller("QueryCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

    /** result list fetched from server */
    $scope.resultList = [];
    /* data to send to server on query */
    $scope.queryData = {
        "username": $cookies.loginName,
        "sql": null,
        "name": null,
        "public": false
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

                // refetch saved queries
                $scope.getPastQueries();

                /* clone existing object, ish */
                $scope.queryData = {
                    name: null,
                    sql: $scope.queryData.sql,
                    username: $cookies.loginName,
                    public: false
                };
            }
        });
    };

    $scope.getResultHeadings = function () {
        return Object.keys($scope.resultList[0]).filter(function(a) {
            return a != "$$hashKey";
        });
    };

    $scope.getPastQueries = function () {
        console.log("Fetching past queries...");
        $http.get("/sql?username=" + $cookies.loginName).success(function (response) {
            console.log("Got past queries");
            console.log(response);
            $scope.pastQueries = response;
        });
    };

    $scope.getPastQueries();
}]);
