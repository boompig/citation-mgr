/* global angular, window */
/* env browser */

angular.module("citationControllers")
    .controller("TopicCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
        const BASE_URL = `${window.location.protocol}//${window.location.host}`;

        /* data to be submitted to API endpoint */
        $scope.topicData = {name: "", description: ""};

        /* data received from API endpoint */
        $scope.topicList = [];

        /* true on success, false on failure */
        $scope.lastStatus = null;
        /* displayed when lastStatus not null, only displays on INSERT */
        $scope.statusMsg = null;

        $scope.removeTopic = function (topicItem) {
            console.log("removing topic:");
            console.log(topicItem);
            $scope.lastStatus = null;

            $http.delete("/topics/" + topicItem.id).success(function (response) {
                console.log("got response:");
                console.log(response);

                if (response.status === "success") {
                    // do not remove until success is returned
                    const i = $scope.topicList.indexOf(topicItem);
                    if (i >= 0) {
                        $scope.topicList.splice(i, 1);
                    }
                    console.log("successfully removed");
                }
            });
        };

        $scope.submitTopic = function () {
            console.log("adding topic:");
            console.log($scope.topicData);

            $http.post("/topics", $scope.topicData).success(function (response) {
                console.log("got response:");
                console.log(response);

                $scope.lastStatus = (response.status === "success");

                if (response.status === "success") {
                    // insert ID is returned in response
                    $scope.topicData.id = response.insert_id;
                    $scope.topicList.push($scope.topicData);
                    $scope.topicData = {name: null, description: null, username: $cookies.loginName};

                    $scope.statusMsg = "Successfully created topic";
                } else {
                    $scope.statusMsg = response.msg;
                }
            });
        };

        $scope.fetchTopicList = function() {
            $http.get("/topics").success(function (response) {
                console.log("got topics:");
                console.log(response);
                $scope.topicList = response;
            });
        };

        $scope.fetchTopicList();

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
