angular.module("citationControllers")
.controller("SectionCtrl", ["$scope", "$route", "$routeParams", "$location", "$http", "$cookies", function($scope, $route, $routeParams, $location, $http, $cookies) {
    /* section represented by input data */
    $scope.sectionData = {
        name: null,
        number: null,
        username: $cookies.loginName
    };

    /* sections in DB */
    $scope.sectionList = [];

    $scope.submitSection = function(e) {
        console.log("submitting section");
        console.log($scope.sectionData);
    };

    $scope.getSectionList = function() {
        $http.get("/sections?username=" + $cookies.loginName, function (response, statusCode) {
            console.log("sections:");
            console.log(response);
            $scope.sectionList = response;
        });
    };

    $scope.getSectionList();
}]);
