/* global angular, window */
/* env browser */


angular.module("citationControllers")
    .controller("LoginCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function ($scope, $route, $routeParams, $location, $http, $cookies) {
        const BASE_URL = `${window.location.protocol}//${window.location.host}`;

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

        $scope.submitLogin = function () {
            // send login to Node, add to users table if not present
            // once done, set a cookie
            console.log("Logging in...");
            console.log($scope.login);
            $http.post("/login", $scope.login).success(function(response) {
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

// run this on load

