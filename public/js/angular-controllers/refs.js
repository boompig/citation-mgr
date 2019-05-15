/* global angular, window */
/* env browser */


angular.module("citationControllers")
    .controller("RefCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
        const BASE_URL = `${window.location.protocol}//${window.location.host}`;

        /** list of topics loaded from DB */
        $scope.topicList = [];

        /** model for reference which will be added to list of references */
        $scope.ref = {
            name: null,
            first_author: null,
            author_group: null,
            year: null,
            topic: null,
            citation_num: null,
            body_of_work: null,
            username: $cookies.loginName
        };

        /* list of references loaded from DB */
        $scope.refList = [];

        /* true on success, false on failure */
        $scope.lastStatus = null;
        /* displayed when lastStatus not null, only displays on INSERT */
        $scope.statusMsg = null;

        $scope.submitRef = function () {
            console.log("adding ref:");
            console.log($scope.ref);

            $http.post("/refs", $scope.ref).success(function (response) {
                console.log("got response:");
                console.log(response);

                $scope.lastStatus = (response.status === "success");

                if (response.status === "success") {
                    // add insert ID to the object
                    $scope.ref.id = response.insert_id;
                    $scope.refList.push($scope.ref);

                    // reset ref
                    $scope.ref = {
                        name: null,
                        first_author: null,
                        author_group: null,
                        year: null,
                        topic: null,
                        citation_num: null,
                        body_of_work: null,
                        username: $cookies.loginName
                    };
                    $scope.statusMsg = "Successfully added reference";
                } else {
                    $scope.statusMsg = response.msg;
                }
            });
        };

        $scope.deleteRef = function (refItem) {
            $scope.statusMsg = null;

            $http.delete("/refs/" + refItem.id).success(function(response) {
                console.log("response:");
                console.log(response);

                if (response.status === "success") {
                    // remove from refList on success
                    let i = $scope.refList.indexOf(refItem);
                    if (i >= 0) {
                        $scope.refList.splice(i, 1);
                    }
                }
            });
        };

        $scope.getRefList = function() {
            $http.get("/refs").success(function(response) {
                console.log("refs:");
                console.log(response);
                $scope.refList = response;
            });
        };

        $scope.getTopicList = function() {
            $http.get("/topics").success(function (response) {
                console.log("got topics:");
                console.log(response);
                $scope.topicList = response;
            });
        };

        $scope.getTopicList();
        $scope.getRefList();
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
