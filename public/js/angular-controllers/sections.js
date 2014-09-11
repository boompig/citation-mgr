angular.module("citationControllers")
.controller("SectionCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    "use strict";

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
        $http.delete("/sections/" + sectionItem.id).success(function(response, statusCode) {
            console.log("successfully deleted section");
            // remove item from list on success
            var i = $scope.sectionList.indexOf(sectionItem);
            if (i >= 0) {
                $scope.sectionList.splice(i, 1);
            }
        });
    };

    $scope.submitSection = function(e) {
        console.log("submitting section");
        console.log($scope.sectionData);

        $http.post("/sections", $scope.sectionData).success(function(response, statusCode) {
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
        $http.get("/sections?username=" + $cookies.loginName).success(function(response, statusCode) {
            console.log("sections:");
            console.log(response);
            $scope.sectionList = response;
        });
    };

    $scope.getSectionList();
}]);
