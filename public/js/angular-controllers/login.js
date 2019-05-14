/* global angular */

angular.module("citationControllers")
    .controller("LoginCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function ($scope, $route, $routeParams, $location, $http, $cookies) {
        "use strict";

        this.loginName = null;

        $scope.login = {
            name: $cookies.loginName
        };

        $scope.errorMsg = null;

        /*
         * intentionally using -this- here
         */
        this.getLoginName = function () {
            return $cookies.loginName;
        };

        $scope.submitLogin = function (event) {
            // send login to Node, add to users table if not present
            // once done, set a cookie
            console.log("Logging in...");
            console.log($scope.login);
            $http.post("/login", $scope.login).success(function (response, statusCode) {
                console.log("response");
                console.log(response);
                if (response.status === "success") {
                    $cookies.loginName = $scope.login.name;
                } else {
                    $scope.errorMsg = response.msg;
                    console.error($scope.errorMsg);
                }
            });
        };
    }]);
