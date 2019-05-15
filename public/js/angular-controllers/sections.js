/* global angular, window */
/* env browser */


angular.module("citationControllers")
    .controller("SectionCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
        const BASE_URL = `${window.location.protocol}//${window.location.host}`;

        $scope.sectionAddErrorMsg = null;
        $scope.sectionAddStatus = null;

        /* section represented by input data */
        $scope.sectionData = {
            name: null,
            section_number: null,
            body_of_work: null,
            username: $cookies.loginName
        };

        /* sections in DB */
        $scope.sectionList = [];

        $scope.getBodyOfWork = function (sectionItem) {
            return sectionItem.body_of_work;
        };

        $scope.removeSection = function(sectionItem) {
            console.log("removing section");
            console.log(sectionItem);
            $http.delete("/sections/" + sectionItem.id).success(function() {
                console.log("successfully deleted section");
                // remove item from list on success
                const i = $scope.sectionList.indexOf(sectionItem);
                if (i >= 0) {
                    $scope.sectionList.splice(i, 1);
                }
            });
        };

        $scope.submitSection = function() {
            console.log("submitting section");
            console.log($scope.sectionData);

            $http.post("/sections", $scope.sectionData).success(function(response) {
                console.log("result:");
                console.log(response);
                if (response.status === "success") {
                    // show success msg
                    $scope.sectionAddStatus = "success";

                    // format data for entry into section list
                    $scope.sectionData.id = response.insert_id;
                    $scope.sectionList.push($scope.sectionData);

                    // reset current submit data
                    $scope.sectionData = {
                        name: null,
                        section_number: null,
                        body_of_work: null,
                        username: $cookies.loginName
                    };
                } else {
                    $scope.sectionAddStatus = "error";
                    // code is a string for some reason, this is a Node thing outside my control
                    if (response.msg.code === "23505") {
                        $scope.sectionAddErrorMsg = "Cannot add duplicate section";
                    } else {
                        $scope.sectionAddErrorMsg = "Error when trying to add this section";
                    }
                }
            });
        };

        $scope.getSectionList = function() {
            $http.get("/sections").success(function(response) {
                console.log("sections:");
                console.log(response);
                $scope.sectionList = response;
            });
        };

        $scope.getSectionList();

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
