/* global angular, window */
/* env browser */

angular.module("citationControllers")
    .controller("QueryCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
        const BASE_URL = `${window.location.protocol}//${window.location.host}`;

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

        $scope.removeQuery = function (queryItem) {
            console.log("Removing query");
            console.log(queryItem);
            $http.delete("/sql/" + queryItem.id).success(function (response) {
                console.log("response:");
                console.log(response);
                if (response.status === "success") {
                    const i = $scope.pastQueries.indexOf(queryItem);
                    if (i >= 0) {
                        $scope.pastQueries.splice(i, 1);
                    }
                }
            });
        };

        $scope.runQuery = function () {
            console.log("Running query");
            console.log($scope.queryData);
            $http.post("/sql", $scope.queryData).success(function(response) {
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
            $http.get("/sql").success(function (response) {
                console.log("Got past queries");
                console.log(response);
                if (response.status !== "error") {
                    $scope.pastQueries = response;
                }
            });
        };

        $scope.getPastQueries();

        /**
         * See https://github.com/github/fetch/issues/256
         */
        $scope.getJSON = async function(path, params) {
            params = params || {};
            const url = new URL(path, BASE_URL);
            Object.keys(params).forEach((key) => {
                url.searchParams.append(key, params[key]);
            });
            return window.fetch(url, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            });
        };

        $scope.getProfile = async function() {
            const response = await $scope.getJSON("/profile", {});
            if(response.ok) {
                const contents = await response.json();
                console.log("profile:");
                console.log(contents);
                // redirect to another part of the page
                $location.path("/refs");
            } else {
                // failed to fetch profile means not logged in
                window.location.href = "/login";
            }
        };

        $scope.getProfile();
    }]);
